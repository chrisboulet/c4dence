'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentOrganizationId } from "@/lib/data/organization"
import { createClient } from "@/lib/supabase/server"
import { MemberRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { z } from "zod"

// Zod schema for input validation
const InviteMemberSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    role: z.nativeEnum(MemberRole)
})

/**
 * Invitations a new member to the current organization.
 * 
 * @param email - The email address of the user to invite
 * @param role - The role to assign (ADMIN, MEMBER, etc.)
 * @returns Object indicating success or failure with error message
 */
export async function inviteMember(email: string, role: MemberRole) {
    try {
        // Validate input using Zod
        const validation = InviteMemberSchema.safeParse({ email, role })
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0].message
            }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return { success: false, error: 'Non authentifié' }
        }

        const organizationId = await getCurrentOrganizationId()
        if (!organizationId) {
            return { success: false, error: 'Organisation introuvable' }
        }

        // Check permissions: Requester must be OWNER or ADMIN
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

        // Check if user is already a member
        const existingMember = await prisma.membership.findFirst({
            where: {
                organizationId,
                profile: { email }
            }
        })

        if (existingMember) {
            return { success: false, error: 'Cet utilisateur est déjà membre de l\'organisation' }
        }

        // Check if invitation already exists (pending and not expired)
        const existingInvitation = await prisma.invitation.findFirst({
            where: {
                organizationId,
                email,
                acceptedAt: null,
                expiresAt: { gt: new Date() }
            }
        })

        if (existingInvitation) {
            // Optional: Resend logic could go here
            return { success: false, error: 'Une invitation est déjà en attente pour cet email (vérifiez les spams)' }
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

        // TODO: Integrate actual email sending service (Resend) here
        // await sendInvitationEmail(email, token)

        revalidatePath('/dashboard/members')
        return { success: true }
    } catch (error) {
        console.error('Invite error:', error)
        return { success: false, error: 'Erreur inattendue lors de l\'invitation' }
    }
}
