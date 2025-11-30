'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Archive, TrendingUp, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WigForm } from './wig-form'
import { archiveWig } from '@/app/actions/wig'
import type { WigSummary, WigStatus } from '@/types'

type WigListProps = {
  wigs: WigSummary[]
  onRefresh: () => void
}

function getStatusVariant(status: WigStatus): 'on-track' | 'at-risk' | 'off-track' {
  switch (status) {
    case 'ON_TRACK':
      return 'on-track'
    case 'AT_RISK':
      return 'at-risk'
    case 'OFF_TRACK':
      return 'off-track'
  }
}

function getStatusLabel(status: WigStatus): string {
  switch (status) {
    case 'ON_TRACK':
      return 'En bonne voie'
    case 'AT_RISK':
      return 'À risque'
    case 'OFF_TRACK':
      return 'Hors piste'
  }
}

function calculateProgress(wig: WigSummary): number {
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

export function WigList({ wigs, onRefresh }: WigListProps) {
  const [editingWig, setEditingWig] = useState<WigSummary | null>(null)

  const handleArchive = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce WIG?')) return
    const result = await archiveWig(id)
    if (result.success) {
      onRefresh()
    }
  }

  if (wigs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucun WIG créé</p>
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
        {wigs.map((wig) => {
          const progress = calculateProgress(wig)
          return (
            <Card key={wig.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{wig.name}</CardTitle>
                    <Badge variant={getStatusVariant(wig.status)}>
                      {getStatusLabel(wig.status)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingWig(wig)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleArchive(wig.id)}
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
                      {formatValue(wig.currentValue, wig.unit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cible</p>
                    <p className="font-semibold">
                      {formatValue(wig.targetValue, wig.unit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Échéance: {format(new Date(wig.endDate), 'd MMMM yyyy', { locale: fr })}
                  </p>
                  <Link
                    href={`/dashboard/wigs/${wig.id}`}
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

      {editingWig && (
        <WigForm
          open={!!editingWig}
          onOpenChange={(open) => !open && setEditingWig(null)}
          wig={editingWig as any}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
