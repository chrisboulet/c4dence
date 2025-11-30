'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WigForm } from './wig-form'
import { WigList } from './wig-list'
import { EngagementWidget } from '@/components/engagement/engagement-widget'
import { getWigs } from '@/app/actions/wig'
import { getEngagementsSummary } from '@/app/actions/engagement'
import { getCurrentWeek } from '@/lib/week'
import type { WigSummary } from '@/types'

type WigDashboardProps = {
  initialWigs?: WigSummary[]
}

export function WigDashboard({ initialWigs }: WigDashboardProps) {
  const [wigs, setWigs] = useState<WigSummary[]>(initialWigs || [])
  const [isLoading, setIsLoading] = useState(!initialWigs)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [engagementPending, setEngagementPending] = useState(0)
  const currentWeek = getCurrentWeek()

  const fetchWigs = useCallback(async () => {
    setIsLoading(true)
    const result = await getWigs()
    if (result.success) {
      setWigs(result.data)
    }
    setIsLoading(false)
  }, [])

  const fetchEngagementsSummary = useCallback(async () => {
    const result = await getEngagementsSummary(currentWeek.year, currentWeek.weekNumber)
    if (result.success) {
      setEngagementPending(result.data.pending)
    }
  }, [currentWeek.year, currentWeek.weekNumber])

  useEffect(() => {
    if (!initialWigs) {
      fetchWigs()
    }
    fetchEngagementsSummary()
  }, [initialWigs, fetchWigs, fetchEngagementsSummary])

  const handleRefresh = () => {
    fetchWigs()
  }

  // Calculs KPIs
  const activeWigsCount = wigs.length
  const onTrackCount = wigs.filter((w) => w.status === 'ON_TRACK').length
  const atRiskCount = wigs.filter((w) => w.status === 'AT_RISK').length
  const offTrackCount = wigs.filter((w) => w.status === 'OFF_TRACK').length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WIGs actifs</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading ? <Skeleton className="h-10 w-16" /> : activeWigsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Objectifs en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Statut des WIGs</CardDescription>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">{onTrackCount}</span>
                <span className="text-xl text-muted-foreground">/</span>
                <span className="text-2xl font-bold text-yellow-600">{atRiskCount}</span>
                <span className="text-xl text-muted-foreground">/</span>
                <span className="text-2xl font-bold text-red-600">{offTrackCount}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              En bonne voie / À risque / Hors piste
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Engagements</CardDescription>
            <CardTitle className="text-4xl">{engagementPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              En attente cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section WIGs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vos objectifs ambitieux (WIGs)</CardTitle>
              <CardDescription>
                Discipline 1 : Se concentrer sur l'essentiel
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau WIG
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <WigList wigs={wigs} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>

      {/* Section Engagements */}
      <EngagementWidget />

      {/* Form Modal */}
      <WigForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
