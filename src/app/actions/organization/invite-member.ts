'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentOrganizationId } from "@/lib/data/organization"
import { createClient } from "@/lib/supabase/server"
import { MemberRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

export async function inviteMember(email: string, role: MemberRole) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return { success: false, error: 'Non authentifié' }
        }

        const organizationId = await getCurrentOrganizationId()
        if (!organizationId) {
            return { success: false, error: 'Organisation introuvable' }
        }

        // Check permissions
        const profile = await prisma.profile.findUnique({ where: { email: user.email } })
        if (!profile) return { success: false, error: 'Profil introuvable' }

        const membership = await prisma.membership.findFirst({
            where: {
                profileId: profile.id,
                organizationId: organizationId
            }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: 'Non autorisé' }
        }

        // Generate token
        const token = randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

        await prisma.invitation.create({
            data: {
                email,
                role,
                organizationId,
                token,
                expiresAt
            }
        })

        // TODO: Send email (Phase X)

        revalidatePath('/dashboard/members')
        return { success: true }
    } catch (error) {
        console.error('Invite error:', error)
        return { success: false, error: 'Erreur lors de l\'invitation' }
    }
}
