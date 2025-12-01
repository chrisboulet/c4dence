import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, Building2, Users, ArrowLeft } from 'lucide-react'

const SUPER_ADMIN_EMAIL = 'christian@bouletstrategies.ca'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-purple/10">
                <Shield className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h1 className="font-semibold">C4DENCE Admin</h1>
                <p className="text-xs text-muted-foreground">Super Admin Panel</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-brand-purple transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Organisations
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-brand-purple transition-colors"
            >
              <Users className="h-4 w-4" />
              Utilisateurs
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
