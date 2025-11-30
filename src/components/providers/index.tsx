'use client'

import { QueryProvider } from './query-provider'

/**
 * Combine tous les providers de l'application
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}
