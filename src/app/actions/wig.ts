'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkPermission, checkWigAccess } from '@/lib/permissions'
import type { ActionResult, CreateWigInput, UpdateWigInput, WigSummary } from '@/types'
import type { Wig, WigStatus } from '@prisma/client'

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
 * Récupère tous les WIGs d'une organisation
 * @param organizationId - ID de l'organisation (optionnel, utilise la première membership si non fourni)
 */
export async function getWigs(organizationId?: string): Promise<ActionResult<WigSummary[]>> {
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
    const permission = await checkPermission(user.id, orgId, 'wig:read')
    if (!permission.allowed) {
      return { success: false, error: permission.error || 'Accès non autorisé' }
    }

    const wigs = await prisma.wig.findMany({
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

    const access = await checkWigAccess(user.id, id, 'wig:read')
    if (!access.allowed) {
      return { success: false, error: access.error || 'WIG non trouvé' }
    }

    const wig = await prisma.wig.findUnique({
      where: { id },
    })

    if (!wig) {
      return { success: false, error: 'WIG non trouvé' }
    }

    return { success: true, data: wig }
  } catch (error) {
    console.error('getWig error:', error)
    return { success: false, error: 'Erreur lors de la récupération du WIG' }
  }
}

/**
 * Crée un nouveau WIG (OWNER/ADMIN uniquement)
 */
export async function createWig(
  input: Omit<CreateWigInput, 'organizationId'> & { organizationId?: string }
): Promise<ActionResult<Wig>> {
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
        orderBy: { createdAt: 'asc' },
      })
      if (!membership) {
        return { success: false, error: 'Aucune organisation trouvée' }
      }
      orgId = membership.organizationId
    }

    // Vérifier la permission de créer un WIG
    const permission = await checkPermission(user.id, orgId, 'wig:create')
    if (!permission.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent créer des WIGs',
      }
    }

    const wig = await prisma.wig.create({
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
 *
 * MEMBER peut uniquement mettre à jour currentValue
 * OWNER/ADMIN peuvent tout modifier
 */
export async function updateWig(input: UpdateWigInput): Promise<ActionResult<Wig>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier l'accès au WIG
    const existingWig = await prisma.wig.findUnique({
      where: { id: input.id },
    })

    if (!existingWig) {
      return { success: false, error: 'WIG non trouvé' }
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
      input.endDate === undefined

    // Vérifier les permissions appropriées
    const requiredPermission = isValueUpdateOnly ? 'wig:update-value' : 'wig:update'
    const permission = await checkPermission(user.id, existingWig.organizationId, requiredPermission)

    if (!permission.allowed) {
      if (!isValueUpdateOnly) {
        return {
          success: false,
          error: 'Seuls les propriétaires et administrateurs peuvent modifier les détails du WIG',
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
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return { success: true, data: existingWig }
    }

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
 * Archive un WIG (soft delete) - OWNER/ADMIN uniquement
 */
export async function archiveWig(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const access = await checkWigAccess(user.id, id, 'wig:delete')
    if (!access.allowed) {
      return {
        success: false,
        error: 'Seuls les propriétaires et administrateurs peuvent archiver des WIGs',
      }
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
