'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { ActionResult, CreateLeadMeasureInput, RecordWeeklyMeasureInput } from '@/types'
import type { LeadMeasure, WeeklyMeasure } from '@prisma/client'

/**
 * Vérifie l'accès de l'utilisateur au WIG
 */
async function verifyWigAccess(wigId: string, userId: string): Promise<boolean> {
  const wig = await prisma.wig.findUnique({
    where: { id: wigId },
    select: { organizationId: true },
  })

  if (!wig) return false

  const membership = await prisma.membership.findFirst({
    where: {
      profileId: userId,
      organizationId: wig.organizationId,
    },
  })

  return !!membership
}

/**
 * Récupère les Lead Measures d'un WIG
 */
export async function getLeadMeasures(wigId: string): Promise<ActionResult<(LeadMeasure & { weeklyMeasures: WeeklyMeasure[] })[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const hasAccess = await verifyWigAccess(wigId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const leadMeasures = await prisma.leadMeasure.findMany({
      where: { wigId },
      include: {
        weeklyMeasures: {
          orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
          take: 12,
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
 */
export async function createLeadMeasure(input: CreateLeadMeasureInput): Promise<ActionResult<LeadMeasure>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const hasAccess = await verifyWigAccess(input.wigId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Obtenir le prochain sortOrder
    const lastMeasure = await prisma.leadMeasure.findFirst({
      where: { wigId: input.wigId },
      orderBy: { sortOrder: 'desc' },
    })

    const leadMeasure = await prisma.leadMeasure.create({
      data: {
        wigId: input.wigId,
        name: input.name,
        description: input.description,
        targetPerWeek: input.targetPerWeek,
        unit: input.unit,
        sortOrder: (lastMeasure?.sortOrder ?? -1) + 1,
      },
    })

    revalidatePath(`/dashboard/wigs/${input.wigId}`)
    return { success: true, data: leadMeasure }
  } catch (error) {
    console.error('createLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la création de la mesure' }
  }
}

/**
 * Met à jour une Lead Measure
 */
export async function updateLeadMeasure(
  id: string,
  input: Partial<Omit<CreateLeadMeasureInput, 'wigId'>>
): Promise<ActionResult<LeadMeasure>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.leadMeasure.findUnique({
      where: { id },
      include: { wig: true },
    })

    if (!existing) {
      return { success: false, error: 'Mesure non trouvée' }
    }

    const hasAccess = await verifyWigAccess(existing.wigId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const leadMeasure = await prisma.leadMeasure.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        targetPerWeek: input.targetPerWeek,
        unit: input.unit,
      },
    })

    revalidatePath(`/dashboard/wigs/${existing.wigId}`)
    return { success: true, data: leadMeasure }
  } catch (error) {
    console.error('updateLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Supprime une Lead Measure
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

    const hasAccess = await verifyWigAccess(existing.wigId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    await prisma.leadMeasure.delete({
      where: { id },
    })

    revalidatePath(`/dashboard/wigs/${existing.wigId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteLeadMeasure error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Enregistre une mesure hebdomadaire
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

    const hasAccess = await verifyWigAccess(leadMeasure.wigId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Accès non autorisé' }
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

    revalidatePath(`/dashboard/wigs/${leadMeasure.wigId}`)
    revalidatePath('/dashboard')
    return { success: true, data: weeklyMeasure }
  } catch (error) {
    console.error('recordWeeklyMeasure error:', error)
    return { success: false, error: "Erreur lors de l'enregistrement" }
  }
}

/**
 * Obtient le numéro de semaine ISO actuel
 */
export function getCurrentWeek(): { year: number; weekNumber: number } {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return { year: now.getFullYear(), weekNumber }
}
