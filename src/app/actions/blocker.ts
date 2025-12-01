'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'
import type { ActionResult, CreateBlockerInput, UpdateBlockerInput, BlockerWithProfile } from '@/types'
import type { Blocker } from '@prisma/client'

/**
 * Récupère les blockers ouverts pour une organisation
 * Tous les membres peuvent voir les blockers de l'organisation
 */
export async function getBlockers(
  organizationId?: string,
  status?: 'OPEN' | 'ESCALATED' | 'RESOLVED' | 'all'
): Promise<ActionResult<BlockerWithProfile[]>> {
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
    const permission = await checkPermission(user.id, orgId, 'objective:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    // Récupérer les Objectifs de l'organisation pour filtrer les blockers
    const objectives = await prisma.objective.findMany({
      where: { organizationId: orgId, isArchived: false },
      select: { id: true },
    })

    const objectiveIds = objectives.map(o => o.id)

    const blockers = await prisma.blocker.findMany({
      where: {
        objectiveId: { in: objectiveIds },
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        objective: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // OPEN first, then ESCALATED, then RESOLVED
        { createdAt: 'desc' },
      ],
    })

    return { success: true, data: blockers as BlockerWithProfile[] }
  } catch (error) {
    console.error('getBlockers error:', error)
    return { success: false, error: 'Erreur lors de la récupération des obstacles' }
  }
}

/**
 * Récupère les blockers pour un Objectif spécifique
 */
export async function getBlockersForObjective(
  objectiveId: string,
  status?: 'OPEN' | 'ESCALATED' | 'RESOLVED' | 'all'
): Promise<ActionResult<BlockerWithProfile[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'Objectif existe et que l'utilisateur y a accès
    const objective = await prisma.objective.findUnique({
      where: { id: objectiveId },
      select: { organizationId: true },
    })

    if (!objective) {
      return { success: false, error: 'Objectif non trouvé' }
    }

    const permission = await checkPermission(user.id, objective.organizationId, 'objective:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const blockers = await prisma.blocker.findMany({
      where: {
        objectiveId,
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        objective: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: blockers as BlockerWithProfile[] }
  } catch (error) {
    console.error('getBlockersForObjective error:', error)
    return { success: false, error: 'Erreur lors de la récupération des obstacles' }
  }
}

/**
 * Crée un nouveau blocker (obstacle)
 * Tous les membres peuvent signaler un obstacle
 */
export async function createBlocker(
  input: CreateBlockerInput
): Promise<ActionResult<Blocker>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'Objectif existe
    const objective = await prisma.objective.findUnique({
      where: { id: input.objectiveId },
      select: { organizationId: true },
    })

    if (!objective) {
      return { success: false, error: 'Objectif non trouvé' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, objective.organizationId, 'objective:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const blocker = await prisma.blocker.create({
      data: {
        objectiveId: input.objectiveId,
        reportedById: user.id,
        description: input.description,
        status: 'OPEN',
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: blocker }
  } catch (error) {
    console.error('createBlocker error:', error)
    return { success: false, error: "Erreur lors de la création de l'obstacle" }
  }
}

/**
 * Met à jour un blocker (escalader ou résoudre)
 */
export async function updateBlocker(
  input: UpdateBlockerInput
): Promise<ActionResult<Blocker>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.blocker.findUnique({
      where: { id: input.id },
      include: {
        objective: { select: { organizationId: true } },
      },
    })

    if (!existing) {
      return { success: false, error: 'Obstacle non trouvé' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, existing.objective.organizationId, 'objective:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const blocker = await prisma.blocker.update({
      where: { id: input.id },
      data: {
        status: input.status,
        escalatedTo: input.escalatedTo,
        resolution: input.resolution,
        resolvedAt: input.status === 'RESOLVED' ? new Date() : null,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: blocker }
  } catch (error) {
    console.error('updateBlocker error:', error)
    return { success: false, error: "Erreur lors de la mise à jour de l'obstacle" }
  }
}

/**
 * Supprime un blocker
 * Seul le reporter ou un admin peut supprimer
 */
export async function deleteBlocker(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.blocker.findUnique({
      where: { id },
      include: {
        objective: { select: { organizationId: true } },
      },
    })

    if (!existing) {
      return { success: false, error: 'Obstacle non trouvé' }
    }

    // Vérifier la permission - admin ou reporter
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: existing.objective.organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Seul le reporter ou un admin peut supprimer
    if (existing.reportedById !== user.id && membership.role === 'MEMBER') {
      return { success: false, error: 'Vous ne pouvez supprimer que vos propres obstacles' }
    }

    await prisma.blocker.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/sync')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteBlocker error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
