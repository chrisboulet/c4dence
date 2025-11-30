'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInWeeks, addWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Plus, Pencil, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WigForm } from './wig-form'
import { UpdateValueDialog } from './update-value-dialog'
import { ProgressChart } from '@/components/charts/progress-chart'
import { LeadMeasureChart } from '@/components/charts/lead-measure-chart'
import { LeadMeasureForm } from '@/components/lead-measure/lead-measure-form'
import { LeadMeasureList } from '@/components/lead-measure/lead-measure-list'
import { getLeadMeasures } from '@/app/actions/lead-measure'
import { getCurrentWeek } from '@/lib/week'
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

function generateLeadMeasureChartData(leadMeasure: LeadMeasure & { weeklyMeasures: WeeklyMeasure[] }) {
  // Sort by week and take last 8 weeks
  const sortedMeasures = [...leadMeasure.weeklyMeasures]
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.weekNumber - b.weekNumber
    })
    .slice(-8)

  return sortedMeasures.map((wm) => ({
    week: `S${wm.weekNumber}`,
    Réalisé: wm.value,
    Cible: leadMeasure.targetPerWeek,
  }))
}

function generateProgressChartData(wig: Wig) {
  const startDate = new Date(wig.startDate)
  const endDate = new Date(wig.endDate)
  const now = new Date()

  const totalWeeks = Math.max(differenceInWeeks(endDate, startDate), 1)
  const currentWeekNum = Math.min(differenceInWeeks(now, startDate), totalWeeks)

  const data: { week: string; Réel: number; Cible: number }[] = []
  const weeklyIncrement = (wig.targetValue - wig.startValue) / totalWeeks

  for (let i = 0; i <= totalWeeks; i++) {
    const weekDate = addWeeks(startDate, i)
    const weekLabel = `S${format(weekDate, 'w')}`
    const targetValue = wig.startValue + (weeklyIncrement * i)

    // Pour les semaines passées et la semaine courante, on interpole vers la valeur actuelle
    // Pour les semaines futures, on ne montre que la cible
    if (i <= currentWeekNum) {
      const progress = currentWeekNum > 0 ? i / currentWeekNum : 0
      const actualValue = wig.startValue + ((wig.currentValue - wig.startValue) * progress)
      data.push({
        week: weekLabel,
        Réel: Math.round(actualValue * 100) / 100,
        Cible: Math.round(targetValue * 100) / 100,
      })
    } else {
      data.push({
        week: weekLabel,
        Réel: Math.round(wig.currentValue * 100) / 100,
        Cible: Math.round(targetValue * 100) / 100,
      })
    }
  }

  return data.slice(0, 12) // Max 12 semaines pour lisibilité
}

export function WigDetail({ wig: initialWig }: WigDetailProps) {
  const router = useRouter()
  const [wig, setWig] = useState(initialWig)
  const [leadMeasures, setLeadMeasures] = useState(initialWig.leadMeasures)
  const [isEditWigOpen, setIsEditWigOpen] = useState(false)
  const [isAddMeasureOpen, setIsAddMeasureOpen] = useState(false)
  const [isUpdateValueOpen, setIsUpdateValueOpen] = useState(false)
  const currentWeek = getCurrentWeek()

  const progressChartData = generateProgressChartData(wig)

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Progression vers l'objectif</CardTitle>
              <CardDescription>
                Discipline 1: Mesure de résultat (Lag Measure)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateValueOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Mettre à jour
            </Button>
          </div>
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
              <p className="text-xl font-bold text-brand-cyan">{formatValue(wig.currentValue, wig.unit)}</p>
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

      {/* Chart de progression */}
      <ProgressChart
        title="Tableau de bord - Progression"
        data={progressChartData}
        unit={wig.unit}
        startValue={wig.startValue}
        targetValue={wig.targetValue}
      />

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

      {/* Lead Measure Charts - Discipline 3: Scoreboard */}
      {leadMeasures.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Tableau de bord</h2>
            <p className="text-sm text-muted-foreground">
              Discipline 3: Maintenir un tableau de bord engageant
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {leadMeasures.map((lm) => {
              const chartData = generateLeadMeasureChartData(lm)
              if (chartData.length === 0) return null
              return (
                <LeadMeasureChart
                  key={lm.id}
                  title={lm.name}
                  data={chartData}
                  unit={lm.unit}
                />
              )
            })}
          </div>
        </div>
      )}

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

      <UpdateValueDialog
        open={isUpdateValueOpen}
        onOpenChange={setIsUpdateValueOpen}
        wigId={wig.id}
        currentValue={wig.currentValue}
        unit={wig.unit}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
