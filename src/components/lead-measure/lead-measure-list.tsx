'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Target, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar'
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LeadMeasureForm } from './lead-measure-form'
import { WeeklyInput } from './weekly-input'
import { deleteLeadMeasure } from '@/app/actions/lead-measure'
import type { LeadMeasure, WeeklyMeasure, Profile } from '@prisma/client'

type LeadMeasureWithWeekly = LeadMeasure & {
  weeklyMeasures: WeeklyMeasure[]
  assignedTo?: Pick<Profile, 'id' | 'fullName' | 'avatarUrl'> | null
}

const MAX_RECOMMENDED_LEAD_MEASURES = 3

type LeadMeasureListProps = {
  objectiveId: string
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
  objectiveId,
  leadMeasures,
  currentWeek,
  onRefresh,
}: LeadMeasureListProps) {
  const [editingMeasure, setEditingMeasure] = useState<LeadMeasure | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet indicateur prédictif?')) return
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
          <p className="mt-4 text-lg font-medium">Aucun indicateur prédictif</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des actions influençables qui prédisent l'atteinte de votre objectif.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {leadMeasures.length > MAX_RECOMMENDED_LEAD_MEASURES && (
        <Alert variant="warning" className="mb-4">
          <AlertIcon variant="warning" />
          <AlertTitle>{leadMeasures.length} indicateurs prédictifs</AlertTitle>
          <AlertDescription>
            Il est recommandé de se concentrer sur{' '}
            <strong>2-3 indicateurs prédictifs maximum</strong> par objectif pour maximiser l'impact.
          </AlertDescription>
        </Alert>
      )}

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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{measure.name}</CardTitle>
                      {/* Assigné */}
                      {measure.assignedTo && (
                        <Avatar className="h-5 w-5" title={`Assigné à: ${measure.assignedTo.fullName}`}>
                          {measure.assignedTo.avatarUrl && (
                            <AvatarImage src={measure.assignedTo.avatarUrl} alt={measure.assignedTo.fullName || ''} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(measure.assignedTo.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
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
          objectiveId={objectiveId}
          leadMeasure={editingMeasure}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
