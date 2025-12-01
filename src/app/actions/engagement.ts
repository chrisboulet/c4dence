'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'
import type { ActionResult, CreateEngagementInput, UpdateEngagementStatusInput, EngagementWithProfile } from '@/types'
import type { Engagement } from '@prisma/client'

/**
 * Récupère les engagements de la semaine courante pour l'organisation
 * Tous les membres peuvent voir les engagements de l'organisation
 */
export async function getEngagements(
  year: number,
  weekNumber: number,
  organizationId?: string
): Promise<ActionResult<EngagementWithProfile[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: true, data: [] }
      }
      orgId = membership.organizationId
    }

    // Vérifier l'accès
    const permission = await checkPermission(user.id, orgId, 'engagement:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        organizationId: orgId,
        year,
        weekNumber,
      },
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: engagements as EngagementWithProfile[] }
  } catch (error) {
    console.error('getEngagements error:', error)
    return { success: false, error: 'Erreur lors de la récupération des engagements' }
  }
}

/**
 * Récupère mes engagements (utilisateur courant) pour une organisation
 */
export async function getMyEngagements(
  year: number,
  weekNumber: number,
  organizationId?: string
): Promise<ActionResult<Engagement[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: true, data: [] }
      }
      orgId = membership.organizationId
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        profileId: user.id,
        organizationId: orgId,
        year,
        weekNumber,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: engagements }
  } catch (error) {
    console.error('getMyEngagements error:', error)
    return { success: false, error: 'Erreur lors de la récupération' }
  }
}

/**
 * Crée un nouvel engagement
 * Tous les membres peuvent créer des engagements
 */
export async function createEngagement(
  input: Omit<CreateEngagementInput, 'organizationId'> & { organizationId?: string }
): Promise<ActionResult<Engagement>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = input.organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: false, error: 'Aucune organisation trouvée' }
      }
      orgId = membership.organizationId
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, orgId, 'engagement:create')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const engagement = await prisma.engagement.create({
      data: {
        profileId: user.id,
        organizationId: orgId,
        year: input.year,
        weekNumber: input.weekNumber,
        description: input.description,
        status: 'PENDING',
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: engagement }
  } catch (error) {
    console.error('createEngagement error:', error)
    return { success: false, error: "Erreur lors de la création de l'engagement" }
  }
}

/**
 * Met à jour le statut d'un engagement
 * Seul le propriétaire de l'engagement peut le modifier (engagement:update-own)
 */
export async function updateEngagementStatus(
  input: UpdateEngagementStatusInput
): Promise<ActionResult<Engagement>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.engagement.findUnique({
      where: { id: input.id },
    })

    if (!existing) {
      return { success: false, error: 'Engagement non trouvé' }
    }

    // Vérifier la permission sur l'organisation
    const permission = await checkPermission(user.id, existing.organizationId, 'engagement:update-own')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    // Seul le propriétaire peut modifier son engagement
    if (existing.profileId !== user.id) {
      return { success: false, error: 'Vous ne pouvez modifier que vos propres engagements' }
    }

    const engagement = await prisma.engagement.update({
      where: { id: input.id },
      data: {
        status: input.status,
        followUpNotes: input.followUpNotes,
        completedAt: input.status === 'COMPLETED' ? new Date() : null,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: engagement }
  } catch (error) {
    console.error('updateEngagementStatus error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Supprime un engagement
 * Seul le propriétaire peut supprimer son engagement
 */
export async function deleteEngagement(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.engagement.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: 'Engagement non trouvé' }
    }

    // Vérifier l'appartenance à l'organisation
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: existing.organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Seul le propriétaire peut supprimer
    if (existing.profileId !== user.id) {
      return { success: false, error: 'Vous ne pouvez supprimer que vos propres engagements' }
    }

    await prisma.engagement.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteEngagement error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Résumé des engagements pour le dashboard (utilisateur courant)
 */
export async function getEngagementsSummary(
  year: number,
  weekNumber: number,
  organizationId?: string
): Promise<ActionResult<{ total: number; completed: number; pending: number; missed: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: true, data: { total: 0, completed: 0, pending: 0, missed: 0 } }
      }
      orgId = membership.organizationId
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        profileId: user.id,
        organizationId: orgId,
        year,
        weekNumber,
      },
      select: { status: true },
    })

    const summary = {
      total: engagements.length,
      completed: engagements.filter((e) => e.status === 'COMPLETED').length,
      pending: engagements.filter((e) => e.status === 'PENDING').length,
      missed: engagements.filter((e) => e.status === 'MISSED').length,
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('getEngagementsSummary error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Compte les engagements de l'utilisateur courant pour une semaine donnée
 * Utilisé pour appliquer la limite recommandée de max 2 engagements par personne par semaine
 */
export async function getMyEngagementsCount(
  year: number,
  weekNumber: number,
  organizationId?: string
): Promise<ActionResult<number>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: true, data: 0 }
      }
      orgId = membership.organizationId
    }

    const count = await prisma.engagement.count({
      where: {
        profileId: user.id,
        organizationId: orgId,
        year,
        weekNumber,
      },
    })

    return { success: true, data: count }
  } catch (error) {
    console.error('getMyEngagementsCount error:', error)
    return { success: false, error: 'Erreur lors du comptage' }
  }
}

/**
 * Résumé des engagements de toute l'équipe pour le dashboard
 */
export async function getTeamEngagementsSummary(
  year: number,
  weekNumber: number,
  organizationId?: string
): Promise<ActionResult<{ total: number; completed: number; pending: number; missed: number; memberCount: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Trouver l'organisation
    let orgId = organizationId
    if (!orgId) {
      const membership = await prisma.membership.findFirst({
        where: { profileId: user.id },
      })
      if (!membership) {
        return { success: true, data: { total: 0, completed: 0, pending: 0, missed: 0, memberCount: 0 } }
      }
      orgId = membership.organizationId
    }

    // Vérifier l'accès
    const permission = await checkPermission(user.id, orgId, 'engagement:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const [engagements, memberCount] = await Promise.all([
      prisma.engagement.findMany({
        where: {
          organizationId: orgId,
          year,
          weekNumber,
        },
        select: { status: true },
      }),
      prisma.membership.count({
        where: { organizationId: orgId },
      }),
    ])

    const summary = {
      total: engagements.length,
      completed: engagements.filter((e) => e.status === 'COMPLETED').length,
      pending: engagements.filter((e) => e.status === 'PENDING').length,
      missed: engagements.filter((e) => e.status === 'MISSED').length,
      memberCount,
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('getTeamEngagementsSummary error:', error)
    return { success: false, error: 'Erreur' }
  }
}
