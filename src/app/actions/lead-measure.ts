'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkObjectiveAccess } from '@/lib/permissions'
import type { ActionResult, CreateLeadMeasureInput, RecordWeeklyMeasureInput } from '@/types'
import type { LeadMeasure, WeeklyMeasure } from '@prisma/client'

/**
 * Récupère les Lead Measures d'un Objectif
 * Tous les membres peuvent lire
 */
export async function getLeadMeasures(objectiveId: string): Promise<ActionResult<(LeadMeasure & { weeklyMeasures: WeeklyMeasure[] })[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const access = await checkObjectiveAccess(user.id, objectiveId, 'lead-measure:read')
    if (!access.allowed) {
      return { success: false, error: access.error || 'Accès non autorisé' }
    }

    const leadMeasures = await prisma.leadMeasure.findMany({
      where: { objectiveId: objectiveId },
      include: {
        weeklyMeasures: {
          orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
          take: 12,
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return { success: true, data: leadMeasures }
  } catch (error) {
    console.error('getLeadMeasures error:', error)
    return { success: false, error: 'Erreur lors de la récupération des mesures' }
  }
}

/**
 * Crée une nouvelle Lead Measure
 * OWNER/ADMIN uniquement
 */
export async function createLeadMeasure(input: CreateLeadMeasureInput): Promise<ActionResult<LeadMeasure>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const access = await checkObjectiveAccess(user.id, input.objectiveId, 'lead-measure:create')
    if (!access.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent créer des mesures',
      }
    }

    // Obtenir le prochain sortOrder
    const lastMeasure = await prisma.leadMeasure.findFirst({
      where: { objectiveId: input.objectiveId },
      orderBy: { sortOrder: 'desc' },
    })

    const leadMeasure = await prisma.leadMeasure.create({
      data: {
        objectiveId: input.objectiveId,
        name: input.name,
        description: input.description,
        targetPerWeek: input.targetPerWeek,
        unit: input.unit,
        sortOrder: (lastMeasure?.sortOrder ?? -1) + 1,
        assignedToId: input.assignedToId, // Responsable
      },
    })

    revalidatePath(`/dashboard/piliers/objectifs/${input.objectiveId}`)
    return { success: true, data: leadMeasure }
  } catch (error) {
    console.error('createLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la création de la mesure' }
  }
}

/**
 * Met à jour une Lead Measure
 * OWNER/ADMIN uniquement
 */
export async function updateLeadMeasure(
  id: string,
  input: Partial<Omit<CreateLeadMeasureInput, 'objectiveId'>> & { assignedToId?: string }
): Promise<ActionResult<LeadMeasure>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.leadMeasure.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: 'Mesure non trouvée' }
    }

    const access = await checkObjectiveAccess(user.id, existing.objectiveId, 'lead-measure:update')
    if (!access.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent modifier les mesures',
      }
    }

    const leadMeasure = await prisma.leadMeasure.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        targetPerWeek: input.targetPerWeek,
        unit: input.unit,
        assignedToId: input.assignedToId, // Responsable
      },
    })

    revalidatePath(`/dashboard/piliers/objectifs/${existing.objectiveId}`)
    return { success: true, data: leadMeasure }
  } catch (error) {
    console.error('updateLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Supprime une Lead Measure
 * OWNER/ADMIN uniquement
 */
export async function deleteLeadMeasure(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.leadMeasure.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: 'Mesure non trouvée' }
    }

    const access = await checkObjectiveAccess(user.id, existing.objectiveId, 'lead-measure:delete')
    if (!access.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent supprimer des mesures',
      }
    }

    await prisma.leadMeasure.delete({
      where: { id },
    })

    revalidatePath(`/dashboard/piliers/objectifs/${existing.objectiveId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Enregistre une mesure hebdomadaire
 * Tous les membres peuvent enregistrer (weekly-measure:record)
 */
export async function recordWeeklyMeasure(input: RecordWeeklyMeasureInput): Promise<ActionResult<WeeklyMeasure>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const leadMeasure = await prisma.leadMeasure.findUnique({
      where: { id: input.leadMeasureId },
    })

    if (!leadMeasure) {
      return { success: false, error: 'Mesure non trouvée' }
    }

    const access = await checkObjectiveAccess(user.id, leadMeasure.objectiveId, 'weekly-measure:record')
    if (!access.allowed) {
      return { success: false, error: access.error || 'Accès non autorisé' }
    }

    // Upsert pour permettre la mise à jour
    const weeklyMeasure = await prisma.weeklyMeasure.upsert({
      where: {
        leadMeasureId_year_weekNumber: {
          leadMeasureId: input.leadMeasureId,
          year: input.year,
          weekNumber: input.weekNumber,
        },
      },
      update: {
        value: input.value,
        notes: input.notes,
      },
      create: {
        leadMeasureId: input.leadMeasureId,
        year: input.year,
        weekNumber: input.weekNumber,
        value: input.value,
        notes: input.notes,
      },
    })

    revalidatePath(`/dashboard/piliers/objectifs/${leadMeasure.objectiveId}`)
    revalidatePath('/dashboard')
    return { success: true, data: weeklyMeasure }
  } catch (error) {
    console.error('recordWeeklyMeasure error:', error)
    return { success: false, error: "Erreur lors de l'enregistrement" }
  }
}
