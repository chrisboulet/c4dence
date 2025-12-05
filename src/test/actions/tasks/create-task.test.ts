import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTask } from '@/app/actions/tasks/create-task'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        task: {
            create: vi.fn(),
        },
    },
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('createTask', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('creates a task successfully', async () => {
        const mockTask = {
            id: '123',
            title: 'New Task',
            description: 'Description',
            organizationId: 'org-1',
            status: 'TO_TRIAGE',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        // Mock implementation
        vi.mocked(prisma.task.create).mockResolvedValue(mockTask as any)

        const result = await createTask({
            title: 'New Task',
            description: 'Description',
            organizationId: 'org-1',
        })

        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                title: 'New Task',
                description: 'Description',
                organizationId: 'org-1',
                status: 'TO_TRIAGE',
            },
        })

        expect(result).toEqual({ success: true, task: mockTask })
    })

    it('returns error if creation fails', async () => {
        vi.mocked(prisma.task.create).mockRejectedValue(new Error('DB Error'))

        const result = await createTask({
            title: 'Fail Task',
            organizationId: 'org-1',
        })

        expect(result).toEqual({ success: false, error: 'Failed to create task' })
    })
})
