import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Page racine — Redirige vers dashboard ou login selon l'état d'auth
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
