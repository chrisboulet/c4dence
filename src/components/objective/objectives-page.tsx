'use client'

import { useState, useEffect, useCallback } from 'react'

import { Plus, Target, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ObjectiveList } from './objective-list'
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
          ) : (
            <ObjectiveList
              objectives={objectives}
              onRefresh={() => currentOrg && fetchObjectives(currentOrg.organizationId)}
            />
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
