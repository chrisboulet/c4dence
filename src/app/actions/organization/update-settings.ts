'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentOrganizationId } from "@/lib/data/organization"
import { revalidatePath } from "next/cache"
import { MemberRole } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"

interface UpdateSettingsParams {
    organizationId: string
    name: string
}

export async function updateSettings({ organizationId, name }: UpdateSettingsParams) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) return { success: false, error: 'Non authentifié' }

        // Check permissions directly via Prisma (easier than using getCurrentOrganizationId for role check)
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

        await prisma.organization.update({
            where: { id: organizationId },
            data: { name }
        })

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error('Update settings error:', error)
        return { success: false, error: 'Erreur mise à jour' }
    }
}
