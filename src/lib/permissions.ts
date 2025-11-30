import prisma from '@/lib/prisma'
import type { MemberRole } from '@prisma/client'

/**
 * Permissions disponibles dans l'application
 */
export type Permission =
  | 'wig:create'
  | 'wig:update'
  | 'wig:update-value' // Mise à jour de currentValue uniquement (pour MEMBER)
  | 'wig:delete'
  | 'wig:read'
  | 'lead-measure:create'
  | 'lead-measure:update'
  | 'lead-measure:delete'
  | 'lead-measure:read'
  | 'weekly-measure:record'
  | 'engagement:create'
  | 'engagement:update-own'
  | 'engagement:read'
  | 'member:invite'
  | 'member:remove'
  | 'org:update'

/**
 * Matrice des permissions par rôle
 *
 * OWNER  → Tous les droits
 * ADMIN  → Tous sauf supprimer org
 * MEMBER → Lecture + mise à jour valeur WIG + engagements propres + record measures
 */
const permissionMatrix: Record<Permission, MemberRole[]> = {
  // WIG permissions
  'wig:create': ['OWNER', 'ADMIN'],
  'wig:update': ['OWNER', 'ADMIN'],
  'wig:update-value': ['OWNER', 'ADMIN', 'MEMBER'], // MEMBER peut mettre à jour currentValue
  'wig:delete': ['OWNER', 'ADMIN'],
  'wig:read': ['OWNER', 'ADMIN', 'MEMBER'],

  // Lead Measure permissions
  'lead-measure:create': ['OWNER', 'ADMIN'],
  'lead-measure:update': ['OWNER', 'ADMIN'],
  'lead-measure:delete': ['OWNER', 'ADMIN'],
  'lead-measure:read': ['OWNER', 'ADMIN', 'MEMBER'],

  // Weekly Measure permissions
  'weekly-measure:record': ['OWNER', 'ADMIN', 'MEMBER'], // Tous peuvent enregistrer

  // Engagement permissions
  'engagement:create': ['OWNER', 'ADMIN', 'MEMBER'],
  'engagement:update-own': ['OWNER', 'ADMIN', 'MEMBER'],
  'engagement:read': ['OWNER', 'ADMIN', 'MEMBER'],

  // Member management
  'member:invite': ['OWNER', 'ADMIN'],
  'member:remove': ['OWNER', 'ADMIN'],

  // Organization settings
  'org:update': ['OWNER', 'ADMIN'],
}

/**
 * Vérifie si un rôle a une permission donnée
 */
export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return permissionMatrix[permission]?.includes(role) ?? false
}

/**
 * Vérifie les permissions d'un utilisateur dans une organisation
 *
 * @returns Le membership si autorisé, null sinon
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<{
  allowed: boolean
  role: MemberRole | null
  error?: string
}> {
  try {
    const membership = await prisma.membership.findFirst({
      where: {
        profileId: userId,
        organizationId,
      },
    })

    if (!membership) {
      return {
        allowed: false,
        role: null,
        error: 'Accès non autorisé à cette organisation',
      }
    }

    const allowed = hasPermission(membership.role, permission)

    return {
      allowed,
      role: membership.role,
      error: allowed ? undefined : 'Permission insuffisante',
    }
  } catch (error) {
    console.error('checkPermission error:', error)
    return {
      allowed: false,
      role: null,
      error: 'Erreur lors de la vérification des permissions',
    }
  }
}

/**
 * Vérifie l'accès à un WIG via son organisation
 */
export async function checkWigAccess(
  userId: string,
  wigId: string,
  permission: Permission
): Promise<{
  allowed: boolean
  role: MemberRole | null
  organizationId: string | null
  error?: string
}> {
  try {
    const wig = await prisma.wig.findUnique({
      where: { id: wigId },
      select: { organizationId: true },
    })

    if (!wig) {
      return {
        allowed: false,
        role: null,
        organizationId: null,
        error: 'WIG non trouvé',
      }
    }

    const result = await checkPermission(userId, wig.organizationId, permission)

    return {
      ...result,
      organizationId: wig.organizationId,
    }
  } catch (error) {
    console.error('checkWigAccess error:', error)
    return {
      allowed: false,
      role: null,
      organizationId: null,
      error: 'Erreur lors de la vérification des permissions',
    }
  }
}

/**
 * Labels des rôles en français
 */
export function getRoleLabel(role: MemberRole): string {
  switch (role) {
    case 'OWNER':
      return 'Propriétaire'
    case 'ADMIN':
      return 'Administrateur'
    case 'MEMBER':
      return 'Membre'
  }
}
