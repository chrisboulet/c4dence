import { createClient } from '@/lib/supabase/server'
import { CadenceMeeting } from '@/components/cadence/cadence-meeting'
import { getCurrentWeek } from '@/lib/week'

export default async function CadencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentWeek = getCurrentWeek()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground mb-1">Discipline 4</p>
          <h1 className="text-3xl font-bold">
            Réunion de <span className="text-gradient">Cadence</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Semaine {currentWeek.weekNumber}, {currentWeek.year}
          </p>
        </div>
      </div>

      {/* Cadence Meeting Component */}
      <CadenceMeeting />
    </div>
  )
}
