import { createClient } from '@/lib/supabase/server'
import { ObjectiveDashboard } from '@/components/objective/objective-dashboard'
import { getCurrentWeek } from '@/lib/week'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentWeek = getCurrentWeek()

  const firstName = user?.email?.split('@')[0] || 'vous'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground mb-1">
            Semaine {currentWeek.weekNumber}, {currentWeek.year}
          </p>
          <h1 className="text-3xl font-bold">
            Bonjour, <span className="text-gradient">{firstName}</span>
          </h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-muted-foreground">Focus sur l'essentiel</p>
          <p className="text-lg font-semibold text-brand-cyan">4 Piliers</p>
        </div>
      </div>

      {/* Objective Dashboard */}
      <ObjectiveDashboard />
    </div>
  )
}
