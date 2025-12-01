'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Target, TrendingUp, Users, CheckCircle2, AlertCircle, XCircle, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { EngagementWidget } from '@/components/engagement/engagement-widget'
import { LeadMeasureChart } from '@/components/charts/lead-measure-chart'
import { WigSessionTimer } from '@/components/cadence/wig-session-timer'
import { WinningIndicator } from '@/components/ui/trend-arrow'
import { BlockerWidget } from '@/components/blocker/blocker-widget'
import { useOrganization } from '@/components/providers/organization-provider'
import { getWigs } from '@/app/actions/wig'
import { getEngagements } from '@/app/actions/engagement'
import { getCurrentWeek } from '@/lib/week'
import type { WigSummary, EngagementWithProfile } from '@/types'

type WeeklyStats = {
  totalEngagements: number
  completedEngagements: number
  pendingEngagements: number
  missedEngagements: number
}

export function CadenceMeeting() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const [wigs, setWigs] = useState<WigSummary[]>([])
  const [engagements, setEngagements] = useState<EngagementWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)

  // Calculate current week based on offset
  const getWeek = useCallback(() => {
    const base = getCurrentWeek()
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + weekOffset * 7)

    const startOfYear = new Date(targetDate.getFullYear(), 0, 1)
    const days = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)

    return { year: targetDate.getFullYear(), weekNumber }
  }, [weekOffset])

  const currentWeek = getWeek()

  const fetchData = useCallback(async (orgId: string) => {
    setIsLoading(true)

    const [wigsResult, engagementsResult] = await Promise.all([
      getWigs(orgId),
      getEngagements(currentWeek.year, currentWeek.weekNumber, orgId),
    ])

    if (wigsResult.success) {
      setWigs(wigsResult.data)
    }
    if (engagementsResult.success) {
      setEngagements(engagementsResult.data)
    }

    setIsLoading(false)
  }, [currentWeek.year, currentWeek.weekNumber])

  // Re-fetch when organization or week changes
  useEffect(() => {
    if (currentOrg && !isOrgLoading) {
      fetchData(currentOrg.organizationId)
    }
  }, [currentOrg, isOrgLoading, fetchData])

  // Stats calculations
  const stats: WeeklyStats = {
    totalEngagements: engagements.length,
    completedEngagements: engagements.filter(e => e.status === 'COMPLETED').length,
    pendingEngagements: engagements.filter(e => e.status === 'PENDING').length,
    missedEngagements: engagements.filter(e => e.status === 'MISSED').length,
  }

  const onTrackWigs = wigs.filter(w => w.status === 'ON_TRACK').length
  const atRiskWigs = wigs.filter(w => w.status === 'AT_RISK').length
  const offTrackWigs = wigs.filter(w => w.status === 'OFF_TRACK').length
  const achievedWigs = wigs.filter(w => w.status === 'ACHIEVED').length

  const completionRate = stats.totalEngagements > 0
    ? Math.round((stats.completedEngagements / stats.totalEngagements) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* WINNING/LOSING Indicator - 4DX Discipline 3 */}
      {!isLoading && wigs.length > 0 && (
        <div className="flex justify-center">
          <WinningIndicator wigs={wigs} />
        </div>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(prev => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Semaine précédente
        </Button>

        <div className="text-center">
          <span className="text-2xl font-bold text-gradient">
            Semaine {currentWeek.weekNumber}
          </span>
          <span className="text-muted-foreground ml-2">
            {currentWeek.year}
          </span>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setWeekOffset(0)}
            >
              Aujourd'hui
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(prev => prev + 1)}
          disabled={weekOffset >= 0}
        >
          Semaine suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* KPIs Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* WIG Status */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-purple/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-purple/10">
                <Target className="h-4 w-4 text-brand-purple" />
              </div>
              <CardDescription>WIGs</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-3">
                {achievedWigs > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-status-on-track" />
                    <span className="text-lg font-bold text-status-on-track">{achievedWigs}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-on-track" />
                  <span className="text-lg font-bold">{onTrackWigs}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-at-risk" />
                  <span className="text-lg font-bold">{atRiskWigs}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-status-off-track" />
                  <span className="text-lg font-bold">{offTrackWigs}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagements Complete */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-cyan/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-cyan/10">
                <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
              </div>
              <CardDescription>Complétés</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-brand-cyan">
                {stats.completedEngagements}
                <span className="text-sm text-muted-foreground ml-1">
                  /{stats.totalEngagements}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagements Pending */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-gold/10">
                <AlertCircle className="h-4 w-4 text-brand-gold" />
              </div>
              <CardDescription>En attente</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-brand-gold">
                {stats.pendingEngagements}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-lime/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-lime/10">
                <TrendingUp className="h-4 w-4 text-brand-lime" />
              </div>
              <CardDescription>Taux de complétion</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {completionRate}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* WIGs Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-purple" />
              Progression des WIGs
            </CardTitle>
            <CardDescription>
              Discipline 1: Focus sur l'essentiel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : wigs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun WIG actif
              </p>
            ) : (
              wigs.map((wig) => {
                const progress = wig.targetValue !== wig.startValue
                  ? ((wig.currentValue - wig.startValue) / (wig.targetValue - wig.startValue)) * 100
                  : 100

                return (
                  <div key={wig.id} className="space-y-2 p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate flex-1">{wig.name}</span>
                      <Badge
                        variant={
                          wig.status === 'ACHIEVED' ? 'achieved' :
                          wig.status === 'ON_TRACK' ? 'on-track' :
                          wig.status === 'AT_RISK' ? 'at-risk' : 'off-track'
                        }
                      >
                        {wig.status === 'ACHIEVED' ? 'Atteint 🏆' :
                         wig.status === 'ON_TRACK' ? 'En bonne voie' :
                         wig.status === 'AT_RISK' ? 'À risque' : 'Hors piste'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(Math.max(progress, 0), 100)} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Actuel: {wig.currentValue} {wig.unit}</span>
                      <span>Cible: {wig.targetValue} {wig.unit}</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Team Engagements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-cyan" />
              Engagements de l'équipe
            </CardTitle>
            <CardDescription>
              Discipline 4: Maintenir une cadence de responsabilité
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : engagements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun engagement cette semaine
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {engagements.map((engagement) => (
                  <div
                    key={engagement.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className={`p-1.5 rounded-full ${
                      engagement.status === 'COMPLETED' ? 'bg-brand-cyan/20' :
                      engagement.status === 'MISSED' ? 'bg-destructive/20' :
                      'bg-brand-gold/20'
                    }`}>
                      {engagement.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-brand-cyan" />
                      ) : engagement.status === 'MISSED' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-brand-gold" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{engagement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {engagement.profile?.fullName || 'Membre'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        engagement.status === 'COMPLETED' ? 'on-track' :
                        engagement.status === 'MISSED' ? 'off-track' : 'at-risk'
                      }
                      className="shrink-0"
                    >
                      {engagement.status === 'COMPLETED' ? 'Fait' :
                       engagement.status === 'MISSED' ? 'Manqué' : 'En cours'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Engagements Section */}
      <EngagementWidget />

      {/* Obstacles Section - 4DX Phase Clear */}
      <BlockerWidget />

      {/* WIG Session Timer and Agenda */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* WIG Session Timer - 4DX Discipline 4 */}
        <WigSessionTimer />

        {/* Cadence Checklist */}
        <Card className="border-brand-purple/30 bg-gradient-to-br from-brand-purple/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Agenda de la réunion de Cadence</CardTitle>
          <CardDescription>
            Les 5 étapes clés pour une réunion efficace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-medium">1</span>
              <div>
                <p className="font-medium">Rendre des comptes</p>
                <p className="text-sm text-muted-foreground">Chaque membre rapporte sur ses engagements de la semaine précédente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-medium">2</span>
              <div>
                <p className="font-medium">Réviser le tableau de bord</p>
                <p className="text-sm text-muted-foreground">Analyser les mesures prédictives et les résultats actuels</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-medium">3</span>
              <div>
                <p className="font-medium">Identifier les blocages</p>
                <p className="text-sm text-muted-foreground">Discuter des obstacles et trouver des solutions en équipe</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-medium">4</span>
              <div>
                <p className="font-medium">Prendre de nouveaux engagements</p>
                <p className="text-sm text-muted-foreground">Chaque membre s'engage sur 1-2 actions spécifiques pour la semaine</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-sm font-medium">5</span>
              <div>
                <p className="font-medium">Célébrer les victoires</p>
                <p className="text-sm text-muted-foreground">Reconnaître les progrès et les succès de l'équipe</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
