import { createClient } from '@/lib/supabase/server'
import { WigDashboard } from '@/components/wig/wig-dashboard'

/**
 * Dashboard principal — Vue d'ensemble des WIGs
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenue, {user?.email}
        </p>
      </div>

      {/* WIG Dashboard */}
      <WigDashboard />
    </div>
  )
}
