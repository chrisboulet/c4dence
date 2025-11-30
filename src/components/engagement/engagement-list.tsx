'use client'

import { useState } from 'react'
import { Check, X, Clock, MoreHorizontal, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateEngagementStatus, deleteEngagement } from '@/app/actions/engagement'
import type { Engagement, EngagementStatus } from '@prisma/client'

type EngagementListProps = {
  engagements: Engagement[]
  onRefresh: () => void
  showActions?: boolean
}

function getStatusIcon(status: EngagementStatus) {
  switch (status) {
    case 'COMPLETED':
      return <Check className="h-4 w-4 text-green-600" />
    case 'MISSED':
      return <X className="h-4 w-4 text-red-600" />
    case 'CANCELLED':
      return <X className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />
  }
}

function getStatusBadge(status: EngagementStatus) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="on-track">Complété</Badge>
    case 'MISSED':
      return <Badge variant="off-track">Manqué</Badge>
    case 'CANCELLED':
      return <Badge variant="outline">Annulé</Badge>
    default:
      return <Badge variant="at-risk">En attente</Badge>
  }
}

export function EngagementList({
  engagements,
  onRefresh,
  showActions = true,
}: EngagementListProps) {
  const handleStatusChange = async (id: string, status: EngagementStatus) => {
    const result = await updateEngagementStatus({ id, status })
    if (result.success) {
      onRefresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet engagement?')) return
    const result = await deleteEngagement(id)
    if (result.success) {
      onRefresh()
    }
  }

  if (engagements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Aucun engagement cette semaine</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {engagements.map((engagement) => (
        <Card key={engagement.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(engagement.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${engagement.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                  {engagement.description}
                </p>
                {engagement.followUpNotes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: {engagement.followUpNotes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(engagement.status)}
                {showActions && engagement.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleStatusChange(engagement.id, 'COMPLETED')}
                      title="Marquer comme complété"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleStatusChange(engagement.id, 'MISSED')}
                      title="Marquer comme manqué"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDelete(engagement.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
