'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Plus, Pencil, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WigForm } from './wig-form'
import { LeadMeasureForm } from '@/components/lead-measure/lead-measure-form'
import { LeadMeasureList } from '@/components/lead-measure/lead-measure-list'
import { getLeadMeasures, getCurrentWeek } from '@/app/actions/lead-measure'
import type { Wig, LeadMeasure, WeeklyMeasure, WigStatus } from '@prisma/client'

type WigWithMeasures = Wig & {
  leadMeasures: (LeadMeasure & { weeklyMeasures: WeeklyMeasure[] })[]
}

type WigDetailProps = {
  wig: WigWithMeasures
}

function getStatusVariant(status: WigStatus): 'on-track' | 'at-risk' | 'off-track' {
  switch (status) {
    case 'ON_TRACK': return 'on-track'
    case 'AT_RISK': return 'at-risk'
    case 'OFF_TRACK': return 'off-track'
  }
}

function getStatusLabel(status: WigStatus): string {
  switch (status) {
    case 'ON_TRACK': return 'En bonne voie'
    case 'AT_RISK': return 'À risque'
    case 'OFF_TRACK': return 'Hors piste'
  }
}

function calculateProgress(wig: Wig): number {
  const range = wig.targetValue - wig.startValue
  if (range === 0) return 100
  const progress = ((wig.currentValue - wig.startValue) / range) * 100
  return Math.min(Math.max(progress, 0), 100)
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

export function WigDetail({ wig: initialWig }: WigDetailProps) {
  const router = useRouter()
  const [wig, setWig] = useState(initialWig)
  const [leadMeasures, setLeadMeasures] = useState(initialWig.leadMeasures)
  const [isEditWigOpen, setIsEditWigOpen] = useState(false)
  const [isAddMeasureOpen, setIsAddMeasureOpen] = useState(false)
  const currentWeek = getCurrentWeek()

  const fetchLeadMeasures = useCallback(async () => {
    const result = await getLeadMeasures(wig.id)
    if (result.success) {
      setLeadMeasures(result.data)
    }
  }, [wig.id])

  const progress = calculateProgress(wig)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{wig.name}</h1>
            <Badge variant={getStatusVariant(wig.status)}>
              {getStatusLabel(wig.status)}
            </Badge>
          </div>
          {wig.description && (
            <p className="text-muted-foreground mt-1">{wig.description}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setIsEditWigOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Progression WIG */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression vers l'objectif</CardTitle>
          <CardDescription>
            Discipline 1: Mesure de résultat (Lag Measure)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatValue(wig.startValue, wig.unit)}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
              <span>{formatValue(wig.targetValue, wig.unit)}</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Départ</p>
              <p className="text-xl font-bold">{formatValue(wig.startValue, wig.unit)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Actuel</p>
              <p className="text-xl font-bold text-primary">{formatValue(wig.currentValue, wig.unit)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cible</p>
              <p className="text-xl font-bold">{formatValue(wig.targetValue, wig.unit)}</p>
            </div>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>Début: {format(new Date(wig.startDate), 'd MMM yyyy', { locale: fr })}</span>
            <span>Échéance: {format(new Date(wig.endDate), 'd MMM yyyy', { locale: fr })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lead Measures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mesures prédictives</CardTitle>
              <CardDescription>
                Discipline 2: Actions influençables et prédictives
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddMeasureOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LeadMeasureList
            wigId={wig.id}
            leadMeasures={leadMeasures}
            currentWeek={currentWeek}
            onRefresh={fetchLeadMeasures}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <WigForm
        open={isEditWigOpen}
        onOpenChange={setIsEditWigOpen}
        wig={wig}
        onSuccess={() => router.refresh()}
      />

      <LeadMeasureForm
        open={isAddMeasureOpen}
        onOpenChange={setIsAddMeasureOpen}
        wigId={wig.id}
        onSuccess={fetchLeadMeasures}
      />
    </div>
  )
}
