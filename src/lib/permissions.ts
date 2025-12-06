import prisma from '@/lib/prisma'
import type { MemberRole } from '@prisma/client'

/**
 * Permissions disponibles dans l'application
 */
export type Permission =
  // Objective permissions (nouveau)
  | 'objective:create'
  | 'objective:update'
  | 'objective:update-value' // Mise à jour de currentValue uniquement (pour MEMBER)
  | 'objective:delete'
  | 'objective:read'
  // Lead Measure (Indicateur Prédictif) permissions
  | 'lead-measure:create'
  | 'lead-measure:update'
  | 'lead-measure:delete'
  | 'lead-measure:read'
  // Weekly Measure permissions
  | 'weekly-measure:record'
  // Engagement permissions
  | 'engagement:create'
  | 'engagement:update-own'
  | 'engagement:read'
  // Member management
  | 'member:invite'
  | 'member:remove'
  // Organization settings
  | 'org:update'
  // Task permissions
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'task:read'

/**
 * Matrice des permissions par rôle
 *
 * OWNER  → Tous les droits
 * ADMIN  → Tous sauf supprimer org
 * MEMBER → Lecture + mise à jour valeur Objectif + engagements propres + record measures
 */
const permissionMatrix: Record<Permission, MemberRole[]> = {
  // Objective permissions
  'objective:create': ['OWNER', 'ADMIN'],
  'objective:update': ['OWNER', 'ADMIN'],
  'objective:update-value': ['OWNER', 'ADMIN', 'MEMBER'], // MEMBER peut mettre à jour currentValue
  'objective:delete': ['OWNER', 'ADMIN'],
  'objective:read': ['OWNER', 'ADMIN', 'MEMBER'],

  // Lead Measure (Indicateur Prédictif) permissions
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

  // Task permissions
  'task:create': ['OWNER', 'ADMIN', 'MEMBER'],
  'task:update': ['OWNER', 'ADMIN', 'MEMBER'],
  'task:delete': ['OWNER', 'ADMIN', 'MEMBER'],
  'task:read': ['OWNER', 'ADMIN', 'MEMBER'],

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
 * Vérifie l'accès à un Objectif via son organisation
 */
export async function checkObjectiveAccess(
  userId: string,
  objectiveId: string,
  permission: Permission
): Promise<{
  allowed: boolean
  role: MemberRole | null
  organizationId: string | null
  error?: string
}> {
  try {
    const objective = await prisma.objective.findUnique({
      where: { id: objectiveId },
      select: { organizationId: true },
    })

    if (!objective) {
      return {
        allowed: false,
        role: null,
        organizationId: null,
        error: 'Objectif non trouvé',
      }
    }

    const result = await checkPermission(userId, objective.organizationId, permission)

    return {
      ...result,
      organizationId: objective.organizationId,
    }
  } catch (error) {
    console.error('checkObjectiveAccess error:', error)
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
