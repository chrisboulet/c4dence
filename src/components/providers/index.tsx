'use client'

import { QueryProvider } from './query-provider'
import { OrganizationProvider } from './organization-provider'

/**
 * Combine tous les providers de l'application
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <OrganizationProvider>
        {children}
      </OrganizationProvider>
    </QueryProvider>
  )
}
