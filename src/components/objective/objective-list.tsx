'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Archive, TrendingUp, ChevronRight, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ObjectiveForm } from './objective-form'
import { archiveObjective } from '@/app/actions/objective'
import type { ObjectiveSummary, ObjectiveStatus } from '@/types'

type ObjectiveListProps = {
  objectives: ObjectiveSummary[]
  onRefresh: () => void
}

function getStatusVariant(status: ObjectiveStatus): 'on-track' | 'at-risk' | 'off-track' | 'achieved' {
  switch (status) {
    case 'ON_TRACK':
      return 'on-track'
    case 'AT_RISK':
      return 'at-risk'
    case 'OFF_TRACK':
      return 'off-track'
    case 'ACHIEVED':
      return 'achieved'
    default:
      return 'at-risk'
  }
}

function getStatusLabel(status: ObjectiveStatus): string {
  switch (status) {
    case 'ON_TRACK':
      return 'En bonne voie'
    case 'AT_RISK':
      return 'À risque'
    case 'OFF_TRACK':
      return 'Hors piste'
    case 'ACHIEVED':
      return 'Objectif atteint!'
    default:
      return 'Inconnu'
  }
}

function calculateProgress(objective: ObjectiveSummary): number {
  const range = objective.targetValue - objective.startValue
  if (range === 0) return 100
  const progress = ((objective.currentValue - objective.startValue) / range) * 100
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

export function ObjectiveList({ objectives, onRefresh }: ObjectiveListProps) {
  const [editingObjective, setEditingObjective] = useState<ObjectiveSummary | null>(null)

  const handleArchive = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cet objectif?')) return
    const result = await archiveObjective(id)
    if (result.success) {
      onRefresh()
    }
  }

  if (objectives.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucun Objectif créé</p>
          <p className="text-sm text-muted-foreground">
            Commencez par définir votre premier objectif stratégique.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {objectives.map((objective) => {
          const progress = calculateProgress(objective)
          return (
            <Card key={objective.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{objective.name}</CardTitle>
                    <Badge variant={getStatusVariant(objective.status)}>
                      {getStatusLabel(objective.status)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingObjective(objective)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleArchive(objective.id)}
                        className="text-red-600"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archiver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Actuel</p>
                    <p className="font-semibold">
                      {formatValue(objective.currentValue, objective.unit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cible</p>
                    <p className="font-semibold">
                      {formatValue(objective.targetValue, objective.unit)}
                    </p>
                  </div>
                </div>

                {objective.owner && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {objective.owner.avatarUrl && (
                                <AvatarImage src={objective.owner.avatarUrl} alt={objective.owner.fullName || ''} />
                              )}
                              <AvatarFallback className="text-xs">
                                {getInitials(objective.owner.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {objective.owner.fullName || 'Responsable'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Responsable : {objective.owner.fullName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Échéance: {format(new Date(objective.endDate), 'd MMMM yyyy', { locale: fr })}
                  </p>
                  <Link
                    href={`/dashboard/objectives/${objective.id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Détails <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingObjective && (
        <ObjectiveForm
          open={!!editingObjective}
          onOpenChange={(open) => !open && setEditingObjective(null)}
          objective={editingObjective as any}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
