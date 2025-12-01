'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

const SUPER_ADMIN_EMAIL = 'christian@bouletstrategies.ca'

// Helper to verify super admin access
async function verifySuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    throw new Error('Unauthorized: Super admin access required')
  }

  return user
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export async function adminGetAllOrganizations() {
  await verifySuperAdmin()

  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          memberships: true,
          wigs: true,
        },
      },
      memberships: {
        where: { role: 'OWNER' },
        include: {
          profile: {
            select: { fullName: true, email: true },
          },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    success: true,
    data: organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      isActive: org.isActive,
      createdAt: org.createdAt,
      memberCount: org._count.memberships,
      wigCount: org._count.wigs,
      owner: org.memberships[0]?.profile || null,
    })),
  }
}

export async function adminCreateOrganization(data: {
  name: string
  ownerEmail: string
}) {
  await verifySuperAdmin()

  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Check if owner profile exists
  let profile = await prisma.profile.findUnique({
    where: { email: data.ownerEmail },
  })

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      slug: `${slug}-${Date.now()}`,
      isActive: true,
    },
  })

  // If profile exists, create membership
  if (profile) {
    await prisma.membership.create({
      data: {
        profileId: profile.id,
        organizationId: organization.id,
        role: 'OWNER',
      },
    })
  } else {
    // Create invitation for owner
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days for admin invites

    await prisma.invitation.create({
      data: {
        organizationId: organization.id,
        email: data.ownerEmail,
        role: 'OWNER',
        token,
        expiresAt,
      },
    })

    // Send invitation email
    await sendInvitationEmail({
      to: data.ownerEmail,
      organizationName: data.name,
      inviterName: 'C4DENCE Admin',
      token,
      role: 'OWNER',
    })
  }

  revalidatePath('/admin')
  return { success: true, data: organization }
}

export async function adminUpdateOrganization(
  orgId: string,
  data: { name?: string; isActive?: boolean }
) {
  await verifySuperAdmin()

  const organization = await prisma.organization.update({
    where: { id: orgId },
    data,
  })

  revalidatePath('/admin')
  return { success: true, data: organization }
}

export async function adminDeleteOrganization(orgId: string) {
  await verifySuperAdmin()

  // Delete will cascade to memberships, wigs, etc.
  await prisma.organization.delete({
    where: { id: orgId },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function adminToggleOrganization(orgId: string) {
  await verifySuperAdmin()

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org) {
    return { success: false, error: 'Organization not found' }
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { isActive: !org.isActive },
  })

  revalidatePath('/admin')
  return { success: true, isActive: !org.isActive }
}

// ============================================================================
// ORGANIZATION DETAILS
// ============================================================================

export async function adminGetOrganizationDetails(orgId: string) {
  await verifySuperAdmin()

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        include: {
          profile: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      invitations: {
        where: { acceptedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      wigs: {
        select: { id: true, name: true, status: true, isArchived: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!organization) {
    return { success: false, error: 'Organization not found' }
  }

  return { success: true, data: organization }
}

// ============================================================================
// INVITATIONS
// ============================================================================

export async function adminSendInvitation(
  orgId: string,
  data: { email: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' }
) {
  await verifySuperAdmin()

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!organization) {
    return { success: false, error: 'Organization not found' }
  }

  // Check if already member
  const existingMember = await prisma.membership.findFirst({
    where: {
      organizationId: orgId,
      profile: { email: data.email },
    },
  })

  if (existingMember) {
    return { success: false, error: 'Cet utilisateur est déjà membre' }
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      organizationId: orgId,
      email: data.email,
      acceptedAt: null,
    },
  })

  if (existingInvite) {
    // Delete old invitation
    await prisma.invitation.delete({ where: { id: existingInvite.id } })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  await prisma.invitation.create({
    data: {
      organizationId: orgId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    },
  })

  await sendInvitationEmail({
    to: data.email,
    organizationName: organization.name,
    inviterName: 'C4DENCE Admin',
    token,
    role: data.role,
  })

  revalidatePath(`/admin/organizations/${orgId}`)
  return { success: true }
}

export async function adminCancelInvitation(invitationId: string) {
  await verifySuperAdmin()

  const invitation = await prisma.invitation.delete({
    where: { id: invitationId },
  })

  revalidatePath(`/admin/organizations/${invitation.organizationId}`)
  return { success: true }
}

// ============================================================================
// MEMBERS
// ============================================================================

export async function adminUpdateMemberRole(
  membershipId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
) {
  await verifySuperAdmin()

  const membership = await prisma.membership.update({
    where: { id: membershipId },
    data: { role },
  })

  revalidatePath(`/admin/organizations/${membership.organizationId}`)
  return { success: true }
}

export async function adminRemoveMember(membershipId: string) {
  await verifySuperAdmin()

  const membership = await prisma.membership.delete({
    where: { id: membershipId },
  })

  revalidatePath(`/admin/organizations/${membership.organizationId}`)
  return { success: true }
}

// ============================================================================
// USERS
// ============================================================================

export async function adminGetAllUsers() {
  await verifySuperAdmin()

  const users = await prisma.profile.findMany({
    include: {
      memberships: {
        include: {
          organization: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    success: true,
    data: users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      organizations: user.memberships.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
      })),
    })),
  }
}
