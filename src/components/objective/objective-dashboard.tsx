'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Target, TrendingUp, CheckCircle2, ExternalLink, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfettiCelebration } from '@/components/ui/confetti-celebration'
import { WinningIndicator } from '@/components/ui/trend-arrow'
import { ObjectiveForm } from './objective-form'
import { ObjectiveList } from './objective-list'
import { EngagementWidget } from '@/components/engagement/engagement-widget'
import { useOrganization } from '@/components/providers/organization-provider'
import { getObjectives } from '@/app/actions/objective'
import { getEngagementsSummary } from '@/app/actions/engagement'
import { getCurrentWeek } from '@/lib/week'
import type { ObjectiveSummary } from '@/types'

type ObjectiveDashboardProps = {
  initialObjectives?: ObjectiveSummary[]
}

export function ObjectiveDashboard({ initialObjectives }: ObjectiveDashboardProps) {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const [objectives, setObjectives] = useState<ObjectiveSummary[]>(initialObjectives || [])
  const [isLoading, setIsLoading] = useState(!initialObjectives)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [engagementPending, setEngagementPending] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [previousAchievedCount, setPreviousAchievedCount] = useState(0)
  const currentWeek = getCurrentWeek()

  const fetchObjectives = useCallback(async (orgId: string) => {
    setIsLoading(true)
    const result = await getObjectives(orgId)
    if (result.success) {
      setObjectives(result.data)
    }
    setIsLoading(false)
  }, [])

  const fetchEngagementsSummary = useCallback(async (orgId: string) => {
    const result = await getEngagementsSummary(currentWeek.year, currentWeek.weekNumber, orgId)
    if (result.success) {
      setEngagementPending(result.data.pending)
    }
  }, [currentWeek.year, currentWeek.weekNumber])

  // Re-fetch when organization changes
  useEffect(() => {
    if (currentOrg && !isOrgLoading) {
      fetchObjectives(currentOrg.organizationId)
      fetchEngagementsSummary(currentOrg.organizationId)
    }
  }, [currentOrg, isOrgLoading, fetchObjectives, fetchEngagementsSummary])

  const handleRefresh = () => {
    if (currentOrg) {
      fetchObjectives(currentOrg.organizationId)
    }
  }

  // Calculs KPIs
  const activeObjectivesCount = objectives.length
  const onTrackCount = objectives.filter((o) => o.status === 'ON_TRACK').length
  const atRiskCount = objectives.filter((o) => o.status === 'AT_RISK').length
  const offTrackCount = objectives.filter((o) => o.status === 'OFF_TRACK').length
  const achievedCount = objectives.filter((o) => o.status === 'ACHIEVED').length

  // Déclencher confetti quand un nouvel objectif est atteint
  useEffect(() => {
    if (achievedCount > previousAchievedCount && previousAchievedCount > 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
    }
    setPreviousAchievedCount(achievedCount)
  }, [achievedCount, previousAchievedCount])

  const MAX_RECOMMENDED_OBJECTIVES = 3

  return (
    <div className="space-y-6">
      {/* Indicateur VICTOIRE/DÉFAITE - Pilier 3 */}
      {!isLoading && activeObjectivesCount > 0 && (
        <div className="flex justify-center">
          <WinningIndicator objectives={objectives} />
        </div>
      )}

      {/* Warning - Trop d'objectifs */}
      {!isLoading && activeObjectivesCount > MAX_RECOMMENDED_OBJECTIVES && (
        <Alert variant="warning">
          <AlertIcon variant="warning" />
          <AlertTitle>Attention : {activeObjectivesCount} Objectifs actifs</AlertTitle>
          <AlertDescription>
            Il est recommandé de se concentrer sur{' '}
            <strong>2-3 objectifs maximum</strong> pour maximiser les chances de
            succès. Envisagez d'archiver ou de prioriser vos objectifs.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-purple/10">
                <Target className="h-4 w-4 text-brand-purple" />
              </div>
              <CardDescription>Objectifs actifs</CardDescription>
            </div>
            <CardTitle className="text-4xl mt-2">
              {isLoading ? <Skeleton className="h-10 w-16" /> : activeObjectivesCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Objectifs en cours
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-cyan/10">
                <TrendingUp className="h-4 w-4 text-brand-cyan" />
              </div>
              <CardDescription>Statut des Objectifs</CardDescription>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-32 mt-2" />
            ) : (
              <div className="flex items-baseline gap-3 mt-2">
                {achievedCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-status-on-track" />
                    <span className="text-2xl font-bold text-status-on-track">{achievedCount}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-on-track" />
                  <span className="text-2xl font-bold">{onTrackCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-at-risk" />
                  <span className="text-2xl font-bold">{atRiskCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-off-track" />
                  <span className="text-2xl font-bold">{offTrackCount}</span>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {achievedCount > 0 ? 'Atteints / ' : ''}En bonne voie / À risque / Hors piste
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-gold/10">
                <CheckCircle2 className="h-4 w-4 text-brand-gold" />
              </div>
              <CardDescription>Engagements</CardDescription>
            </div>
            <CardTitle className="text-4xl mt-2">{engagementPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              En attente cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Objectifs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vos objectifs stratégiques</CardTitle>
              <CardDescription>
                Pilier 1 : Se concentrer sur l'essentiel
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Objectif
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
            <ObjectiveList objectives={objectives} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>

      {/* Section Engagements */}
      <EngagementWidget />

      {/* Form Modal */}
      <ObjectiveForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleRefresh}
      />

      {/* Confetti pour célébrer les objectifs atteints */}
      <ConfettiCelebration trigger={showConfetti} />
    </div>
  )
}
