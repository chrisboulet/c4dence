'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'
import type { ActionResult } from '@/types'
import type { Task, TaskStatus } from '@prisma/client'

/**
 * Récupère toutes les tâches de l'organisation
 */
export async function getTasks(organizationId: string): Promise<ActionResult<Task[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, organizationId, 'objective:read')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const tasks = await prisma.task.findMany({
      where: { organizationId },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: tasks }
  } catch (error) {
    console.error('getTasks error:', error)
    return { success: false, error: 'Erreur lors de la récupération des tâches' }
  }
}

/**
 * Crée une nouvelle tâche
 */
export async function createTask(formData: FormData): Promise<ActionResult<Task>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const organizationId = formData.get('organizationId') as string

    if (!title || !organizationId) {
      return { success: false, error: 'Titre et organisation requis' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, organizationId, 'objective:create')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || undefined,
        organizationId,
        status: 'TO_TRIAGE',
      },
    })

    revalidatePath('/dashboard/plancher/flux')
    return { success: true, data: task }
  } catch (error) {
    console.error('createTask error:', error)
    return { success: false, error: 'Erreur lors de la création de la tâche' }
  }
}

/**
 * Met à jour le statut d'une tâche (drag & drop)
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<ActionResult<Task>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, existing.organizationId, 'objective:update')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'DONE' ? new Date() : null,
      },
    })

    revalidatePath('/dashboard/plancher/flux')
    return { success: true, data: task }
  } catch (error) {
    console.error('updateTaskStatus error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Met à jour une tâche
 */
export async function updateTask(taskId: string, formData: FormData): Promise<ActionResult<Task>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, existing.organizationId, 'objective:update')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null

    if (!title) {
      return { success: false, error: 'Titre requis' }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description: description || undefined,
      },
    })

    revalidatePath('/dashboard/plancher/flux')
    return { success: true, data: task }
  } catch (error) {
    console.error('updateTask error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Supprime une tâche
 */
export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existing) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, existing.organizationId, 'objective:delete')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    revalidatePath('/dashboard/plancher/flux')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteTask error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
