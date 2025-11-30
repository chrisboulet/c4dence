'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LeadMeasureForm } from './lead-measure-form'
import { WeeklyInput } from './weekly-input'
import { deleteLeadMeasure } from '@/app/actions/lead-measure'
import type { LeadMeasure, WeeklyMeasure } from '@prisma/client'

type LeadMeasureWithWeekly = LeadMeasure & {
  weeklyMeasures: WeeklyMeasure[]
}

type LeadMeasureListProps = {
  wigId: string
  leadMeasures: LeadMeasureWithWeekly[]
  currentWeek: { year: number; weekNumber: number }
  onRefresh: () => void
}

function getWeeklyValue(
  measures: WeeklyMeasure[],
  year: number,
  weekNumber: number
): number | undefined {
  const measure = measures.find(
    (m) => m.year === year && m.weekNumber === weekNumber
  )
  return measure?.value
}

function calculateWeeklyAverage(measures: WeeklyMeasure[]): number {
  if (measures.length === 0) return 0
  const sum = measures.reduce((acc, m) => acc + m.value, 0)
  return sum / measures.length
}

export function LeadMeasureList({
  wigId,
  leadMeasures,
  currentWeek,
  onRefresh,
}: LeadMeasureListProps) {
  const [editingMeasure, setEditingMeasure] = useState<LeadMeasure | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette mesure prédictive?')) return
    const result = await deleteLeadMeasure(id)
    if (result.success) {
      onRefresh()
    }
  }

  if (leadMeasures.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucune mesure prédictive</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des actions influençables qui prédisent l'atteinte de votre objectif.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {leadMeasures.map((measure) => {
          const currentValue = getWeeklyValue(
            measure.weeklyMeasures,
            currentWeek.year,
            currentWeek.weekNumber
          )
          const average = calculateWeeklyAverage(measure.weeklyMeasures)
          const avgPercentage = Math.round((average / measure.targetPerWeek) * 100)

          return (
            <Card key={measure.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{measure.name}</CardTitle>
                    {measure.description && (
                      <p className="text-sm text-muted-foreground">
                        {measure.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingMeasure(measure)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(measure.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Cible: {measure.targetPerWeek} {measure.unit}/semaine
                  </span>
                  <span className="text-muted-foreground">
                    Moy: {average.toFixed(1)} ({avgPercentage}%)
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Semaine {currentWeek.weekNumber} ({currentWeek.year})
                  </p>
                  <WeeklyInput
                    leadMeasureId={measure.id}
                    year={currentWeek.year}
                    weekNumber={currentWeek.weekNumber}
                    currentValue={currentValue}
                    target={measure.targetPerWeek}
                    unit={measure.unit}
                    onSuccess={onRefresh}
                  />
                </div>

                {measure.weeklyMeasures.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Historique (dernières semaines)
                    </p>
                    <div className="flex gap-1">
                      {measure.weeklyMeasures.slice(0, 8).map((wm) => {
                        const pct = Math.min((wm.value / measure.targetPerWeek) * 100, 100)
                        const bgColor =
                          pct >= 100
                            ? 'bg-green-500'
                            : pct >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        return (
                          <div
                            key={wm.id}
                            className="flex-1 h-2 rounded bg-muted overflow-hidden"
                            title={`S${wm.weekNumber}: ${wm.value} ${measure.unit} (${Math.round(pct)}%)`}
                          >
                            <div
                              className={`h-full ${bgColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingMeasure && (
        <LeadMeasureForm
          open={!!editingMeasure}
          onOpenChange={(open) => !open && setEditingMeasure(null)}
          wigId={wigId}
          leadMeasure={editingMeasure}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
