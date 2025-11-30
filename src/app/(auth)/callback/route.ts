import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Callback OAuth — Échange le code contre une session
 * Redirige vers onboarding si l'utilisateur n'a pas d'organisation
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Vérifier si l'utilisateur a des memberships
      const membership = await prisma.membership.findFirst({
        where: { profileId: data.user.id },
      })

      if (!membership) {
        // Pas de membership → onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Erreur — redirige vers login avec message
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
