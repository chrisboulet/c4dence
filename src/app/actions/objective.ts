'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkPermission, checkObjectiveAccess } from '@/lib/permissions'
import { createObjectiveSchema, updateObjectiveSchema } from '@/lib/schemas'
import type { ActionResult, CreateObjectiveInput, UpdateObjectiveInput, ObjectiveSummary } from '@/types'
import type { Objective, ObjectiveStatus } from '@prisma/client'

/**
 * Calcule le statut d'un Objectif basé sur la progression vs le temps écoulé
 * ACHIEVED quand l'objectif est atteint (currentValue >= targetValue)
 */
function calculateObjectiveStatus(objective: {
  startValue: number
  targetValue: number
  currentValue: number
  startDate: Date
  endDate: Date
}): ObjectiveStatus {
  // Vérifier si l'objectif est atteint
  const valueRange = objective.targetValue - objective.startValue
  const currentProgress = valueRange === 0 ? 1 : (objective.currentValue - objective.startValue) / valueRange

  // Si l'objectif est atteint (100% ou plus), marquer comme ACHIEVED
  if (currentProgress >= 1) {
    return 'ACHIEVED'
  }

  const now = new Date()
  const totalDuration = objective.endDate.getTime() - objective.startDate.getTime()
  const elapsed = now.getTime() - objective.startDate.getTime()
  const timeProgress = Math.min(elapsed / totalDuration, 1)

  const expectedProgress = timeProgress
  const ratio = expectedProgress === 0 ? 1 : currentProgress / expectedProgress

  if (ratio >= 0.9) return 'ON_TRACK'
  if (ratio >= 0.7) return 'AT_RISK'
  return 'OFF_TRACK'
}

/**
 * Récupère tous les Objectifs d'une organisation
 * @param organizationId - ID de l'organisation (optionnel, utilise la première membership si non fourni)
 */
export async function getObjectives(organizationId?: string): Promise<ActionResult<ObjectiveSummary[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Si pas d'organizationId, prendre la première membership
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

    const objectives = await prisma.objective.findMany({
      where: {
        organizationId: orgId,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        status: true,
        startValue: true,
        targetValue: true,
        currentValue: true,
        unit: true,
        startDate: true,
        endDate: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: objectives }
  } catch (error) {
    console.error('getObjectives error:', error)
    return { success: false, error: 'Erreur lors de la récupération des Objectifs' }
  }
}

/**
 * Récupère un Objectif par son ID
 */
export async function getObjective(id: string): Promise<ActionResult<Objective>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const access = await checkObjectiveAccess(user.id, id, 'objective:read')
    if (!access.allowed) {
      return { success: false, error: access.error || 'Objectif non trouvé' }
    }

    const objective = await prisma.objective.findUnique({
      where: { id },
    })

    if (!objective) {
      return { success: false, error: 'Objectif non trouvé' }
    }

    return { success: true, data: objective }
  } catch (error) {
    console.error('getObjective error:', error)
    return { success: false, error: "Erreur lors de la récupération de l'Objectif" }
  }
}

/**
 * Crée un nouvel Objectif (OWNER/ADMIN uniquement)
 */
export async function createObjective(
  rawInput: unknown
): Promise<ActionResult<Objective>> {
  try {
    const validationResult = createObjectiveSchema.safeParse(rawInput)
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0].message }
    }
    const input = validationResult.data

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
        orderBy: { createdAt: 'asc' },
      })
      if (!membership) {
        return { success: false, error: 'Aucune organisation trouvée' }
      }
      orgId = membership.organizationId
    }

    // Vérifier la permission de créer un Objectif
    const permission = await checkPermission(user.id, orgId, 'objective:create')
    if (!permission.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent créer des Objectifs',
      }
    }

    const objective = await prisma.objective.create({
      data: {
        organizationId: orgId,
        name: input.name,
        description: input.description,
        startValue: input.startValue,
        targetValue: input.targetValue,
        currentValue: input.startValue,
        unit: input.unit,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'AT_RISK',
        ownerId: input.ownerId, // Responsable de l'Objectif
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: objective }
  } catch (error) {
    console.error('createObjective error:', error)
    return { success: false, error: "Erreur lors de la création de l'Objectif" }
  }
}

/**
 * Met à jour un Objectif existant
 *
 * MEMBER peut uniquement mettre à jour currentValue
 * OWNER/ADMIN peuvent tout modifier
 */
export async function updateObjective(rawInput: unknown): Promise<ActionResult<Objective>> {
  try {
    const validationResult = updateObjectiveSchema.safeParse(rawInput)
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.issues[0].message }
    }
    const input = validationResult.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier l'accès à l'Objectif
    const existingObjective = await prisma.objective.findUnique({
      where: { id: input.id },
    })

    if (!existingObjective) {
      return { success: false, error: 'Objectif non trouvé' }
    }

    // Déterminer si c'est une mise à jour de valeur uniquement
    const isValueUpdateOnly =
      input.currentValue !== undefined &&
      input.name === undefined &&
      input.description === undefined &&
      input.startValue === undefined &&
      input.targetValue === undefined &&
      input.unit === undefined &&
      input.startDate === undefined &&
      input.endDate === undefined &&
      input.ownerId === undefined

    // Vérifier les permissions appropriées
    const requiredPermission = isValueUpdateOnly ? 'objective:update-value' : 'objective:update'
    const permission = await checkPermission(user.id, existingObjective.organizationId, requiredPermission)

    if (!permission.allowed) {
      if (!isValueUpdateOnly) {
        return {
          success: false,
          error: "Seuls les propriétaires et administrateurs peuvent modifier les détails de l'Objectif",
        }
      }
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const { id, ...updateData } = input

    // Préparer les données de mise à jour
    const dataToUpdate: Record<string, unknown> = {}

    // MEMBER: seulement currentValue
    if (permission.role === 'MEMBER') {
      if (updateData.currentValue !== undefined) {
        dataToUpdate.currentValue = updateData.currentValue
      }
    } else {
      // OWNER/ADMIN: tout
      if (updateData.name !== undefined) dataToUpdate.name = updateData.name
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description
      if (updateData.startValue !== undefined) dataToUpdate.startValue = updateData.startValue
      if (updateData.targetValue !== undefined) dataToUpdate.targetValue = updateData.targetValue
      if (updateData.currentValue !== undefined) dataToUpdate.currentValue = updateData.currentValue
      if (updateData.unit !== undefined) dataToUpdate.unit = updateData.unit
      if (updateData.startDate !== undefined) dataToUpdate.startDate = updateData.startDate
      if (updateData.endDate !== undefined) dataToUpdate.endDate = updateData.endDate
      if (updateData.ownerId !== undefined) dataToUpdate.ownerId = updateData.ownerId
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return { success: true, data: existingObjective }
    }

    const objective = await prisma.objective.update({
      where: { id },
      data: dataToUpdate,
    })

    // Recalculer le statut
    const newStatus = calculateObjectiveStatus(objective)
    if (newStatus !== objective.status) {
      await prisma.objective.update({
        where: { id },
        data: { status: newStatus },
      })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/piliers/objectifs/${id}`)
    return { success: true, data: { ...objective, status: newStatus } }
  } catch (error) {
    console.error('updateObjective error:', error)
    return { success: false, error: "Erreur lors de la mise à jour de l'Objectif" }
  }
}

/**
 * Archive un Objectif (soft delete) - OWNER/ADMIN uniquement
 */
export async function archiveObjective(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const access = await checkObjectiveAccess(user.id, id, 'objective:delete')
    if (!access.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent archiver des Objectifs',
      }
    }

    await prisma.objective.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('archiveObjective error:', error)
    return { success: false, error: "Erreur lors de l'archivage de l'Objectif" }
  }
}

// =============================================================================
// ALIASES DE COMPATIBILITÉ (déprécié - à supprimer après migration complète)
// =============================================================================

/** @deprecated Utiliser getObjectives */
export const getWigs = getObjectives
/** @deprecated Utiliser getObjective */
export const getWig = getObjective
/** @deprecated Utiliser createObjective */
export const createWig = createObjective
/** @deprecated Utiliser updateObjective */
export const updateWig = updateObjective
/** @deprecated Utiliser archiveObjective */
export const archiveWig = archiveObjective
/** @deprecated Utiliser calculateObjectiveStatus */
export const calculateWigStatus = calculateObjectiveStatus
