'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EngagementForm } from './engagement-form'
import { EngagementList } from './engagement-list'
import { getMyEngagements } from '@/app/actions/engagement'
import { getCurrentWeek } from '@/lib/week'
import type { Engagement } from '@prisma/client'

export function EngagementWidget() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const currentWeek = getCurrentWeek()

  const fetchEngagements = useCallback(async () => {
    setIsLoading(true)
    const result = await getMyEngagements(currentWeek.year, currentWeek.weekNumber)
    if (result.success) {
      setEngagements(result.data)
    }
    setIsLoading(false)
  }, [currentWeek.year, currentWeek.weekNumber])

  useEffect(() => {
    fetchEngagements()
  }, [fetchEngagements])

  const pendingCount = engagements.filter((e) => e.status === 'PENDING').length
  const completedCount = engagements.filter((e) => e.status === 'COMPLETED').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Mes engagements</CardTitle>
            <CardDescription>
              Semaine {currentWeek.weekNumber} — {completedCount}/{engagements.length} complétés
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <EngagementList
            engagements={engagements}
            onRefresh={fetchEngagements}
          />
        )}
      </CardContent>

      <EngagementForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        year={currentWeek.year}
        weekNumber={currentWeek.weekNumber}
        onSuccess={fetchEngagements}
      />
    </Card>
  )
}
