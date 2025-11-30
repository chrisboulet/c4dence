'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getUserMemberships } from '@/app/actions/organization'
import type { MembershipWithOrg, MemberRole } from '@/types'

type OrganizationContextValue = {
  /** Organisation courante sélectionnée */
  currentOrg: MembershipWithOrg | null
  /** Changer l'organisation courante */
  setCurrentOrg: (membership: MembershipWithOrg) => void
  /** Toutes les memberships de l'utilisateur */
  userMemberships: MembershipWithOrg[]
  /** Chargement en cours */
  isLoading: boolean
  /** Rafraîchir les memberships */
  refetch: () => Promise<void>
  /** Rôle de l'utilisateur dans l'org courante */
  currentRole: MemberRole | null
  /** Est-ce que l'utilisateur est OWNER ou ADMIN */
  isAdmin: boolean
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

const STORAGE_KEY = 'c4dence-current-org-id'

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [userMemberships, setUserMemberships] = useState<MembershipWithOrg[]>([])
  const [currentOrg, setCurrentOrgState] = useState<MembershipWithOrg | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMemberships = useCallback(async () => {
    setIsLoading(true)
    const result = await getUserMemberships()

    if (result.success) {
      setUserMemberships(result.data)

      // Restaurer l'org depuis localStorage ou prendre la première
      const savedOrgId = typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : null

      if (savedOrgId) {
        const savedMembership = result.data.find(
          (m) => m.organizationId === savedOrgId
        )
        if (savedMembership) {
          setCurrentOrgState(savedMembership)
        } else if (result.data.length > 0) {
          setCurrentOrgState(result.data[0])
        }
      } else if (result.data.length > 0) {
        setCurrentOrgState(result.data[0])
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchMemberships()
  }, [fetchMemberships])

  const setCurrentOrg = useCallback((membership: MembershipWithOrg) => {
    setCurrentOrgState(membership)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, membership.organizationId)
    }
  }, [])

  const currentRole = currentOrg?.role ?? null
  const isAdmin = currentRole === 'OWNER' || currentRole === 'ADMIN'

  const value = useMemo(() => ({
    currentOrg,
    setCurrentOrg,
    userMemberships,
    isLoading,
    refetch: fetchMemberships,
    currentRole,
    isAdmin,
  }), [currentOrg, setCurrentOrg, userMemberships, isLoading, fetchMemberships, currentRole, isAdmin])

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle minimum
 */
export function useHasRole(minimumRole: MemberRole): boolean {
  const { currentRole } = useOrganization()

  if (!currentRole) return false

  const roleHierarchy: Record<MemberRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  }

  return roleHierarchy[currentRole] >= roleHierarchy[minimumRole]
}
