import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Layout du dashboard — Vérifie l'authentification
 * TODO Sprint 1: Ajouter AppShell avec sidebar
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: AppShell avec sidebar */}
      <main className="p-6">{children}</main>
    </div>
  )
}
