import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Dashboard principal — Vue d'ensemble des WIGs
 * TODO Sprint 1: Implémenter avec données réelles
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

      {/* KPIs placeholder */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WIGs actifs</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Objectifs en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mesures cette semaine</CardDescription>
            <CardTitle className="text-4xl">0/0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Lead measures enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Engagements</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              En attente cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* WIGs placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vos objectifs ambitieux (WIGs)</CardTitle>
          <CardDescription>
            Aucun WIG créé. Commencez par définir votre premier objectif stratégique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="on-track">ON TRACK</Badge>
            <Badge variant="at-risk">AT RISK</Badge>
            <Badge variant="off-track">OFF TRACK</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
