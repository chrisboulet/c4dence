'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateTaskInput {
    title: string
    description?: string
    organizationId: string
}

export async function createTask({ title, description, organizationId }: CreateTaskInput) {
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                organizationId,
                status: 'TO_TRIAGE',
            },
        })

        revalidatePath('/dashboard/plancher')
        return { success: true, task }
    } catch (error) {
        console.error('Failed to create task:', error)
        return { success: false, error: 'Failed to create task' }
    }
}
