'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { ActionResult, MembershipWithOrg, CreateOrganizationInput, InviteMemberInput } from '@/types'
import type { Organization, MemberRole } from '@prisma/client'

/**
 * Récupère toutes les memberships de l'utilisateur avec leurs organisations
 */
export async function getUserMemberships(): Promise<ActionResult<MembershipWithOrg[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // S'assurer que le profil existe
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name || null,
          avatarUrl: user.user_metadata?.avatar_url || null,
        },
      })
    }

    const memberships = await prisma.membership.findMany({
      where: { profileId: user.id },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    })

    return { success: true, data: memberships }
  } catch (error) {
    console.error('getUserMemberships error:', error)
    return { success: false, error: 'Erreur lors de la récupération des organisations' }
  }
}

/**
 * Crée une nouvelle organisation et ajoute l'utilisateur comme OWNER
 */
export async function createOrganization(
  input: CreateOrganizationInput
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // S'assurer que le profil existe
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      })
    }

    // Générer un slug unique
    const baseSlug = input.slug || input.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // Créer l'organisation avec le membership OWNER
    const organization = await prisma.organization.create({
      data: {
        name: input.name,
        slug,
        memberships: {
          create: {
            profileId: user.id,
            role: 'OWNER',
          },
        },
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: organization }
  } catch (error) {
    console.error('createOrganization error:', error)
    return { success: false, error: "Erreur lors de la création de l'organisation" }
  }
}

/**
 * Récupère une organisation par ID (avec vérification d'accès)
 */
export async function getOrganization(id: string): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: id,
      },
      include: { organization: true },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    return { success: true, data: membership.organization }
  } catch (error) {
    console.error('getOrganization error:', error)
    return { success: false, error: "Erreur lors de la récupération de l'organisation" }
  }
}

/**
 * Met à jour une organisation (OWNER/ADMIN uniquement)
 */
export async function updateOrganization(
  id: string,
  data: Partial<Pick<Organization, 'name' | 'cadenceDay' | 'cadenceTime' | 'logoUrl'>>
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return { success: false, error: 'Permission refusée' }
    }

    const organization = await prisma.organization.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard')
    return { success: true, data: organization }
  } catch (error) {
    console.error('updateOrganization error:', error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

/**
 * Invite un membre dans une organisation (OWNER/ADMIN uniquement)
 */
export async function inviteMember(
  input: InviteMemberInput
): Promise<ActionResult<{ inviteId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est OWNER ou ADMIN
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: input.organizationId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return { success: false, error: 'Permission refusée' }
    }

    // Vérifier si l'email est déjà membre
    const existingProfile = await prisma.profile.findUnique({
      where: { email: input.email },
    })

    if (existingProfile) {
      const existingMembership = await prisma.membership.findFirst({
        where: {
          profileId: existingProfile.id,
          organizationId: input.organizationId,
        },
      })

      if (existingMembership) {
        return { success: false, error: 'Cet utilisateur est déjà membre' }
      }
    }

    // Créer l'invitation
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: input.organizationId,
        email: input.email,
        role: input.role || 'MEMBER',
        token,
        expiresAt,
      },
    })

    // TODO: Envoyer l'email d'invitation via Supabase ou autre service
    // Pour l'instant, on retourne juste l'ID pour afficher le lien

    return { success: true, data: { inviteId: invitation.id } }
  } catch (error) {
    console.error('inviteMember error:', error)
    return { success: false, error: "Erreur lors de l'invitation" }
  }
}

/**
 * Accepte une invitation
 */
export async function acceptInvitation(token: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return { success: false, error: 'Invitation invalide' }
    }

    if (invitation.acceptedAt) {
      return { success: false, error: 'Invitation déjà acceptée' }
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: 'Invitation expirée' }
    }

    // Vérifier que l'email correspond
    if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
      return { success: false, error: "Cette invitation n'est pas pour vous" }
    }

    // S'assurer que le profil existe
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      })
    }

    // Créer le membership
    await prisma.membership.create({
      data: {
        profileId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    })

    // Marquer l'invitation comme acceptée
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    })

    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('acceptInvitation error:', error)
    return { success: false, error: "Erreur lors de l'acceptation" }
  }
}

/**
 * Liste les membres d'une organisation
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<ActionResult<Array<{
  id: string
  role: MemberRole
  profile: { id: string; email: string; fullName: string | null; avatarUrl: string | null }
}>>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier l'accès
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId,
      },
    })

    if (!membership) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const members = await prisma.membership.findMany({
      where: { organizationId },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first
        { createdAt: 'asc' },
      ],
    })

    return { success: true, data: members }
  } catch (error) {
    console.error('getOrganizationMembers error:', error)
    return { success: false, error: 'Erreur lors de la récupération' }
  }
}

/**
 * Liste les invitations en attente d'une organisation
 */
export async function getPendingInvitations(
  organizationId: string
): Promise<ActionResult<Array<{
  id: string
  email: string
  role: MemberRole
  expiresAt: Date
}>>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est OWNER ou ADMIN
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return { success: false, error: 'Permission refusée' }
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: invitations }
  } catch (error) {
    console.error('getPendingInvitations error:', error)
    return { success: false, error: 'Erreur lors de la récupération' }
  }
}

/**
 * Retire un membre d'une organisation (OWNER uniquement)
 */
export async function removeMember(membershipId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Récupérer le membership à supprimer
    const targetMembership = await prisma.membership.findUnique({
      where: { id: membershipId },
    })

    if (!targetMembership) {
      return { success: false, error: 'Membre non trouvé' }
    }

    // Vérifier que l'utilisateur est OWNER de cette organisation
    const userMembership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: targetMembership.organizationId,
        role: 'OWNER',
      },
    })

    if (!userMembership) {
      return { success: false, error: 'Seul le propriétaire peut retirer des membres' }
    }

    // Empêcher la suppression du dernier OWNER
    if (targetMembership.role === 'OWNER') {
      const ownerCount = await prisma.membership.count({
        where: {
          organizationId: targetMembership.organizationId,
          role: 'OWNER',
        },
      })

      if (ownerCount <= 1) {
        return { success: false, error: 'Impossible de retirer le dernier propriétaire' }
      }
    }

    // Supprimer le membership
    await prisma.membership.delete({
      where: { id: membershipId },
    })

    revalidatePath('/dashboard/members')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('removeMember error:', error)
    return { success: false, error: 'Erreur lors de la suppression du membre' }
  }
}

/**
 * Annule une invitation (OWNER/ADMIN)
 */
export async function cancelInvitation(invitationId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Récupérer l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return { success: false, error: 'Invitation non trouvée' }
    }

    // Vérifier que l'utilisateur est OWNER ou ADMIN
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: user.id,
        organizationId: invitation.organizationId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    })

    if (!membership) {
      return { success: false, error: 'Permission refusée' }
    }

    // Supprimer l'invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    })

    revalidatePath('/dashboard/members')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('cancelInvitation error:', error)
    return { success: false, error: "Erreur lors de l'annulation" }
  }
}
