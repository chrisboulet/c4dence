import type { MemberRole } from '@prisma/client'

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

/**
 * Hiérarchie des rôles (pour comparaison)
 */
export const roleHierarchy: Record<MemberRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
}

/**
 * Vérifie si un rôle a au moins le niveau minimum
 */
export function hasMinimumRole(
  currentRole: MemberRole | null,
  minimumRole: MemberRole
): boolean {
  if (!currentRole) return false
  return roleHierarchy[currentRole] >= roleHierarchy[minimumRole]
}
