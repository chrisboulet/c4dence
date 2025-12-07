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
    const permission = await checkPermission(user.id, organizationId, 'task:read')
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
    const assignedToId = formData.get('assignedToId') as string | null
    const urgency = formData.get('urgency') as 'HIGH' | 'LOW' | null
    const businessImpact = formData.get('businessImpact') as 'HIGH' | 'LOW' | null
    const dueDateStr = formData.get('dueDate') as string | null

    if (!title || !organizationId) {
      return { success: false, error: 'Titre et organisation requis' }
    }

    // Vérifier la permission
    const permission = await checkPermission(user.id, organizationId, 'task:create')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Calcul automatique de la catégorie si urgence et impact sont fournis
    let category: 'IMMEDIATE' | 'PLAN' | 'DELEGATE' | 'BACKLOG' | undefined
    if (urgency && businessImpact) {
      if (urgency === 'HIGH' && businessImpact === 'HIGH') category = 'IMMEDIATE'
      else if (urgency === 'LOW' && businessImpact === 'HIGH') category = 'PLAN'
      else if (urgency === 'HIGH' && businessImpact === 'LOW') category = 'DELEGATE'
      else category = 'BACKLOG'
    }

    console.log('createTask inputs:', { title, organizationId, assignedToId, urgency, businessImpact, dueDateStr })

    const task = await prisma.task.create({
      data: {
        title,
        description: description || undefined,
        organizationId,
        assignedToId: assignedToId || undefined,
        urgency: urgency || undefined,
        businessImpact: businessImpact || undefined,
        category,
        dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
        status: 'TO_TRIAGE',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    })

    revalidatePath('/dashboard/plancher/flux')
    return { success: true, data: task }
  } catch (error) {
    console.error('createTask FULL ERROR:', error)
    if (error instanceof Error) {
      console.error('createTask Error Message:', error.message)
      console.error('createTask Error Stack:', error.stack)
    }
    return { success: false, error: `Erreur interne: ${error instanceof Error ? error.message : 'Inconnue'}` }
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
    const permission = await checkPermission(user.id, existing.organizationId, 'task:update')
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
    const permission = await checkPermission(user.id, existing.organizationId, 'task:update')
    if (!permission.allowed) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const assignedToId = formData.get('assignedToId') as string | null
    const urgency = formData.get('urgency') as 'HIGH' | 'LOW' | null
    const businessImpact = formData.get('businessImpact') as 'HIGH' | 'LOW' | null
    const dueDateStr = formData.get('dueDate') as string | null

    if (!title) {
      return { success: false, error: 'Titre requis' }
    }

    // Calcul automatique de la catégorie si urgence et impact sont fournis
    let category = existing.category
    if (urgency && businessImpact) {
      if (urgency === 'HIGH' && businessImpact === 'HIGH') category = 'IMMEDIATE'
      else if (urgency === 'LOW' && businessImpact === 'HIGH') category = 'PLAN'
      else if (urgency === 'HIGH' && businessImpact === 'LOW') category = 'DELEGATE'
      else category = 'BACKLOG'
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description: description || undefined,
        assignedToId: assignedToId || undefined,
        urgency: urgency || undefined,
        businessImpact: businessImpact || undefined,
        category,
        dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
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
    const permission = await checkPermission(user.id, existing.organizationId, 'task:delete')
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
