'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createOrganization(formData: FormData) {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    if (!name || name.length < 3) {
        return { error: 'Le nom doit contenir au moins 3 caractères' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Non authentifié' }
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { email: user.email! }
        })

        if (!profile) return { error: 'Profil introuvable' }

        // Check slug uniqueness
        const existing = await prisma.organization.findUnique({ where: { slug } })
        if (existing) {
            return { error: 'Cet identifiant est déjà utilisé' }
        }

        const org = await prisma.organization.create({
            data: {
                name,
                slug,
                memberships: {
                    create: {
                        profileId: profile.id,
                        role: 'OWNER'
                    }
                }
            }
        })

        revalidatePath('/dashboard')
        // Redirect logic will be handled client-side or we can return the ID
        return { success: true, organizationId: org.id }
    } catch (e) {
        console.error(e)
        return { error: 'Erreur lors de la création' }
    }
}
