import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function getCurrentOrganizationId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Find the profile and their memberships
    const profile = await prisma.profile.findUnique({
        where: { email: user.email! },
        include: {
            memberships: {
                take: 1, // For MVP, just take the first one
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!profile || profile.memberships.length === 0) {
        return null
    }

    return profile.memberships[0].organizationId
}
