'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BlockerForm } from './blocker-form'
import { BlockerList } from './blocker-list'
import { useOrganization } from '@/components/providers/organization-provider'
import { getBlockers } from '@/app/actions/blocker'
import type { BlockerWithProfile } from '@/types'

export function BlockerWidget() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const [blockers, setBlockers] = useState<BlockerWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchBlockers = useCallback(async (orgId: string) => {
    setIsLoading(true)
    // Récupérer seulement les OPEN et ESCALATED par défaut
    const result = await getBlockers(orgId, 'all')
    if (result.success) {
      setBlockers(result.data)
    }
    setIsLoading(false)
  }, [])

  // Re-fetch when organization changes
  useEffect(() => {
    if (currentOrg && !isOrgLoading) {
      fetchBlockers(currentOrg.organizationId)
    }
  }, [currentOrg, isOrgLoading, fetchBlockers])

  const openCount = blockers.filter(b => b.status === 'OPEN').length
  const escalatedCount = blockers.filter(b => b.status === 'ESCALATED').length
  const activeCount = openCount + escalatedCount

  return (
    <Card className="border-status-at-risk/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-status-at-risk/10">
              <AlertTriangle className="h-5 w-5 text-status-at-risk" />
            </div>
            <div>
              <CardTitle className="text-lg">Obstacles à lever</CardTitle>
              <CardDescription>
                Identifiez et résolvez les blocages
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <span className="text-sm font-medium text-status-at-risk">
                {activeCount} actif{activeCount > 1 ? 's' : ''}
              </span>
            )}
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Signaler
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <BlockerList blockers={blockers} onRefresh={() => currentOrg && fetchBlockers(currentOrg.organizationId)} />
        )}
      </CardContent>

      <BlockerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => currentOrg && fetchBlockers(currentOrg.organizationId)}
      />
    </Card>
  )
}
