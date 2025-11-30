import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy Next.js 16 — Gère les redirects/rewrites légers
 * NOTE: L'authentification est gérée dans les Server Components (dashboard/layout.tsx)
 * Voir: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export function proxy(request: NextRequest) {
  // Refresh Supabase session via cookie update
  const response = NextResponse.next({
    request,
  })

  return response
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
