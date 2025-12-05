import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inviteMember } from '@/app/actions/organization/invite-member'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        invitation: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
        profile: {
            findUnique: vi.fn(),
        },
        membership: {
            findFirst: vi.fn(),
        }
    }
}))

vi.mock('@/lib/data/organization', () => ({
    getCurrentOrganizationId: vi.fn(() => Promise.resolve('org-1'))
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { email: 'admin@example.com' } } }))
        }
    }))
}))

describe('inviteMember', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('creates an invitation successfully', async () => {
        const mockInvitation = { id: 'inv-1', email: 'new@example.com', token: 'xyz' }
        vi.mocked(prisma.invitation.create).mockResolvedValue(mockInvitation as any)

        // Mock user permission (admin is member of org-1)
        vi.mocked(prisma.profile.findUnique).mockResolvedValue({ id: 'p1' } as any)
        vi.mocked(prisma.membership.findFirst).mockResolvedValue({ role: 'ADMIN' } as any)

        const result = await inviteMember('new@example.com', 'MEMBER')

        expect(result.success).toBe(true)
        expect(prisma.invitation.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                email: 'new@example.com',
                role: 'MEMBER',
                organizationId: 'org-1'
            })
        }))
        expect(revalidatePath).toHaveBeenCalled()
    })

    it('fails if user is not authorized', async () => {
        // Admin is NOT member of org-1
        vi.mocked(prisma.membership.findFirst).mockResolvedValue(null)

        const result = await inviteMember('new@example.com', 'MEMBER')

        expect(result.success).toBe(false)
        expect(result.error).toContain('Non autorisé')
    })
})
