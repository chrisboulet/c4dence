'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { ActionResult, CreateWigInput, UpdateWigInput, WigSummary } from '@/types'
import type { Wig, WigStatus } from '@prisma/client'

/**
 * Récupère ou crée l'organisation par défaut de l'utilisateur
 */
async function getOrCreateDefaultOrg(userId: string, userEmail: string) {
  // Chercher une membership existante
  const membership = await prisma.membership.findFirst({
    where: { profileId: userId },
    include: { organization: true },
  })

  if (membership) {
    return membership.organization
  }

  // Créer le profil s'il n'existe pas
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

  return org
}

/**
 * Calcule le statut d'un WIG basé sur la progression vs le temps écoulé
 */
function calculateWigStatus(wig: {
  startValue: number
  targetValue: number
  currentValue: number
  startDate: Date
  endDate: Date
}): WigStatus {
  const now = new Date()
  const totalDuration = wig.endDate.getTime() - wig.startDate.getTime()
  const elapsed = now.getTime() - wig.startDate.getTime()
  const timeProgress = Math.min(elapsed / totalDuration, 1)

  const valueRange = wig.targetValue - wig.startValue
  const currentProgress = valueRange === 0 ? 1 : (wig.currentValue - wig.startValue) / valueRange
  const expectedProgress = timeProgress

  const ratio = expectedProgress === 0 ? 1 : currentProgress / expectedProgress

  if (ratio >= 0.9) return 'ON_TRACK'
  if (ratio >= 0.7) return 'AT_RISK'
  return 'OFF_TRACK'
}

/**
 * Récupère tous les WIGs de l'utilisateur
 */
export async function getWigs(): Promise<ActionResult<WigSummary[]>> {
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

    const wigs = await prisma.wig.findMany({
      where: {
        organizationId: membership.organizationId,
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
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: wigs }
  } catch (error) {
    console.error('getWigs error:', error)
    return { success: false, error: 'Erreur lors de la récupération des WIGs' }
  }
}

/**
 * Récupère un WIG par son ID
 */
export async function getWig(id: string): Promise<ActionResult<Wig>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const wig = await prisma.wig.findUnique({
      where: { id },
    })

    if (!wig) {
      return { success: false, error: 'WIG non trouvé' }
    }

    // Vérifier l'accès
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: wig.organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    return { success: true, data: wig }
  } catch (error) {
    console.error('getWig error:', error)
    return { success: false, error: 'Erreur lors de la récupération du WIG' }
  }
}

/**
 * Crée un nouveau WIG
 */
export async function createWig(input: Omit<CreateWigInput, 'organizationId'>): Promise<ActionResult<Wig>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const org = await getOrCreateDefaultOrg(user.id, user.email!)

    const wig = await prisma.wig.create({
      data: {
        organizationId: org.id,
        name: input.name,
        description: input.description,
        startValue: input.startValue,
        targetValue: input.targetValue,
        currentValue: input.startValue,
        unit: input.unit,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'AT_RISK',
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: wig }
  } catch (error) {
    console.error('createWig error:', error)
    return { success: false, error: 'Erreur lors de la création du WIG' }
  }
}

/**
 * Met à jour un WIG existant
 */
export async function updateWig(input: UpdateWigInput): Promise<ActionResult<Wig>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier l'accès
    const existingWig = await prisma.wig.findUnique({
      where: { id: input.id },
    })

    if (!existingWig) {
      return { success: false, error: 'WIG non trouvé' }
    }

    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: existingWig.organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const { id, ...updateData } = input

    // Préparer les données de mise à jour
    const dataToUpdate: Record<string, unknown> = {}
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description
    if (updateData.startValue !== undefined) dataToUpdate.startValue = updateData.startValue
    if (updateData.targetValue !== undefined) dataToUpdate.targetValue = updateData.targetValue
    if (updateData.currentValue !== undefined) dataToUpdate.currentValue = updateData.currentValue
    if (updateData.unit !== undefined) dataToUpdate.unit = updateData.unit
    if (updateData.startDate !== undefined) dataToUpdate.startDate = updateData.startDate
    if (updateData.endDate !== undefined) dataToUpdate.endDate = updateData.endDate

    const wig = await prisma.wig.update({
      where: { id },
      data: dataToUpdate,
    })

    // Recalculer le statut
    const newStatus = calculateWigStatus(wig)
    if (newStatus !== wig.status) {
      await prisma.wig.update({
        where: { id },
        data: { status: newStatus },
      })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/wigs/${id}`)
    return { success: true, data: { ...wig, status: newStatus } }
  } catch (error) {
    console.error('updateWig error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du WIG' }
  }
}

/**
 * Archive un WIG (soft delete)
 */
export async function archiveWig(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const wig = await prisma.wig.findUnique({
      where: { id },
    })

    if (!wig) {
      return { success: false, error: 'WIG non trouvé' }
    }

    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: wig.organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    await prisma.wig.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('archiveWig error:', error)
    return { success: false, error: "Erreur lors de l'archivage du WIG" }
  }
}
