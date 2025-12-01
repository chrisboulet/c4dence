'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Target, ArrowRight, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ObjectiveForm } from './objective-form'
import { useOrganization } from '@/components/providers/organization-provider'
import { getObjectives } from '@/app/actions/objective'
import type { ObjectiveSummary } from '@/types'

function getStatusConfig(status: string) {
  switch (status) {
    case 'ON_TRACK':
      return {
        variant: 'on-track' as const,
        label: 'En bonne voie',
        icon: TrendingUp,
        color: 'text-brand-cyan',
      }
    case 'AT_RISK':
      return {
        variant: 'at-risk' as const,
        label: 'À risque',
        icon: AlertTriangle,
        color: 'text-brand-gold',
      }
    default:
      return {
        variant: 'off-track' as const,
        label: 'Hors piste',
        icon: XCircle,
        color: 'text-destructive',
      }
  }
}

function formatValue(value: number, unit: string): string {
  if (unit === '$' || unit === 'M$') {
    return `${value.toLocaleString('fr-CA')} ${unit}`
  }
  if (unit === '%') {
    return `${value}%`
  }
  return `${value.toLocaleString('fr-CA')} ${unit}`
}

export function ObjectivesPage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const [objectives, setObjectives] = useState<ObjectiveSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchObjectives = useCallback(async (orgId: string) => {
    setIsLoading(true)
    const result = await getObjectives(orgId)
    if (result.success) {
      setObjectives(result.data)
    }
    setIsLoading(false)
  }, [])

  // Re-fetch when organization changes
  useEffect(() => {
    if (currentOrg && !isOrgLoading) {
      fetchObjectives(currentOrg.organizationId)
    }
  }, [currentOrg, isOrgLoading, fetchObjectives])

  const onTrack = objectives.filter((o) => o.status === 'ON_TRACK').length
  const atRisk = objectives.filter((o) => o.status === 'AT_RISK').length
  const offTrack = objectives.filter((o) => o.status === 'OFF_TRACK').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Objectifs</CardDescription>
            <CardTitle className="text-3xl">{objectives.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-on-track" />
              <CardDescription>En bonne voie</CardDescription>
            </div>
            <CardTitle className="text-3xl text-brand-cyan">{onTrack}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-at-risk" />
              <CardDescription>À risque</CardDescription>
            </div>
            <CardTitle className="text-3xl text-brand-gold">{atRisk}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-off-track" />
              <CardDescription>Hors piste</CardDescription>
            </div>
            <CardTitle className="text-3xl text-destructive">{offTrack}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Objectifs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tous vos Objectifs</CardTitle>
              <CardDescription>
                Gérez vos objectifs stratégiques
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucun Objectif créé</h3>
              <p className="text-muted-foreground mt-1">
                Commencez par créer votre premier objectif stratégique
              </p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un Objectif
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((objective) => {
                const statusConfig = getStatusConfig(objective.status)
                const StatusIcon = statusConfig.icon
                const progress = objective.targetValue !== objective.startValue
                  ? ((objective.currentValue - objective.startValue) / (objective.targetValue - objective.startValue)) * 100
                  : 100

                return (
                  <Link key={objective.id} href={`/dashboard/objectives/${objective.id}`}>
                    <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-secondary ${statusConfig.color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{objective.name}</h3>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Progress
                                  value={Math.min(Math.max(progress, 0), 100)}
                                  className="h-2"
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {Math.round(progress)}%
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>
                                Actuel: {formatValue(objective.currentValue, objective.unit)}
                              </span>
                              <span>→</span>
                              <span>
                                Cible: {formatValue(objective.targetValue, objective.unit)}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <ObjectiveForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => currentOrg && fetchObjectives(currentOrg.organizationId)}
      />
    </div>
  )
}
