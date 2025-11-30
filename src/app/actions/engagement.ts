'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { ActionResult, CreateEngagementInput, UpdateEngagementStatusInput, EngagementWithProfile } from '@/types'
import type { Engagement, EngagementStatus } from '@prisma/client'

/**
 * Récupère ou crée l'organisation et le profil de l'utilisateur
 */
async function getOrCreateUserContext(userId: string, userEmail: string) {
  let profile = await prisma.profile.findUnique({
    where: { id: userId },
  })

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: userId,
        email: userEmail,
      },
    })
  }

  const membership = await prisma.membership.findFirst({
    where: { profileId: userId },
    include: { organization: true },
  })

  if (!membership) {
    // Créer une organisation par défaut
    const slug = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
    const org = await prisma.organization.create({
      data: {
        name: 'Mon Organisation',
        slug: `${slug}-${Date.now()}`,
        memberships: {
          create: {
            profileId: userId,
            role: 'OWNER',
          },
        },
      },
    })
    return { profile, organizationId: org.id }
  }

  return { profile, organizationId: membership.organizationId }
}

/**
 * Récupère les engagements de la semaine courante
 */
export async function getEngagements(
  year: number,
  weekNumber: number
): Promise<ActionResult<EngagementWithProfile[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const membership = await prisma.membership.findFirst({
      where: { profileId: user.id },
    })

    if (!membership) {
      return { success: true, data: [] }
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        organizationId: membership.organizationId,
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
 * Récupère mes engagements (utilisateur courant)
 */
export async function getMyEngagements(
  year: number,
  weekNumber: number
): Promise<ActionResult<Engagement[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        profileId: user.id,
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
 */
export async function createEngagement(
  input: Omit<CreateEngagementInput, 'organizationId'>
): Promise<ActionResult<Engagement>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { organizationId } = await getOrCreateUserContext(user.id, user.email!)

    const engagement = await prisma.engagement.create({
      data: {
        profileId: user.id,
        organizationId,
        year: input.year,
        weekNumber: input.weekNumber,
        description: input.description,
        status: 'PENDING',
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: engagement }
  } catch (error) {
    console.error('createEngagement error:', error)
    return { success: false, error: "Erreur lors de la création de l'engagement" }
  }
}

/**
 * Met à jour le statut d'un engagement
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

    // Seul le propriétaire peut modifier
    if (existing.profileId !== user.id) {
      return { success: false, error: 'Non autorisé' }
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
    return { success: true, data: engagement }
  } catch (error) {
    console.error('updateEngagementStatus error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Supprime un engagement
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

    if (existing.profileId !== user.id) {
      return { success: false, error: 'Non autorisé' }
    }

    await prisma.engagement.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteEngagement error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Résumé des engagements pour le dashboard
 */
export async function getEngagementsSummary(
  year: number,
  weekNumber: number
): Promise<ActionResult<{ total: number; completed: number; pending: number; missed: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const engagements = await prisma.engagement.findMany({
      where: {
        profileId: user.id,
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
