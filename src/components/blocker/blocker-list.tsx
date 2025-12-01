'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, MoreHorizontal, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateBlocker, deleteBlocker } from '@/app/actions/blocker'
import type { BlockerWithProfile } from '@/types'

type BlockerListProps = {
  blockers: BlockerWithProfile[]
  onRefresh: () => void
}

export function BlockerList({ blockers, onRefresh }: BlockerListProps) {
  const [escalateDialog, setEscalateDialog] = useState<BlockerWithProfile | null>(null)
  const [resolveDialog, setResolveDialog] = useState<BlockerWithProfile | null>(null)
  const [escalateTo, setEscalateTo] = useState('')
  const [resolution, setResolution] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEscalate = async () => {
    if (!escalateDialog || !escalateTo.trim()) return

    setIsSubmitting(true)
    const result = await updateBlocker({
      id: escalateDialog.id,
      status: 'ESCALATED',
      escalatedTo: escalateTo,
    })
    setIsSubmitting(false)

    if (result.success) {
      setEscalateDialog(null)
      setEscalateTo('')
      onRefresh()
    }
  }

  const handleResolve = async () => {
    if (!resolveDialog) return

    setIsSubmitting(true)
    const result = await updateBlocker({
      id: resolveDialog.id,
      status: 'RESOLVED',
      resolution: resolution || undefined,
    })
    setIsSubmitting(false)

    if (result.success) {
      setResolveDialog(null)
      setResolution('')
      onRefresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet obstacle?')) return
    const result = await deleteBlocker(id)
    if (result.success) {
      onRefresh()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4 text-status-at-risk" />
      case 'ESCALATED':
        return <ArrowUpRight className="h-4 w-4 text-brand-gold" />
      case 'RESOLVED':
        return <CheckCircle2 className="h-4 w-4 text-status-on-track" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="at-risk">Ouvert</Badge>
      case 'ESCALATED':
        return <Badge variant="at-risk" className="bg-brand-gold/20 text-brand-gold border-brand-gold/30">Escaladé</Badge>
      case 'RESOLVED':
        return <Badge variant="on-track">Résolu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (blockers.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-status-on-track/50" />
          <p className="mt-4 text-lg font-medium">Aucun obstacle</p>
          <p className="text-sm text-muted-foreground">
            Bravo! Aucun obstacle ne bloque actuellement vos WIGs.
          </p>
        </CardContent>
      </Card>
    )
  }

  const openBlockers = blockers.filter(b => b.status === 'OPEN')
  const escalatedBlockers = blockers.filter(b => b.status === 'ESCALATED')
  const resolvedBlockers = blockers.filter(b => b.status === 'RESOLVED')

  return (
    <>
      <div className="space-y-4">
        {/* Open Blockers */}
        {openBlockers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-status-at-risk flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Obstacles ouverts ({openBlockers.length})
            </h4>
            {openBlockers.map((blocker) => (
              <BlockerCard
                key={blocker.id}
                blocker={blocker}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                onEscalate={() => setEscalateDialog(blocker)}
                onResolve={() => setResolveDialog(blocker)}
                onDelete={() => handleDelete(blocker.id)}
              />
            ))}
          </div>
        )}

        {/* Escalated Blockers */}
        {escalatedBlockers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-brand-gold flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Escaladés ({escalatedBlockers.length})
            </h4>
            {escalatedBlockers.map((blocker) => (
              <BlockerCard
                key={blocker.id}
                blocker={blocker}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                onResolve={() => setResolveDialog(blocker)}
                onDelete={() => handleDelete(blocker.id)}
              />
            ))}
          </div>
        )}

        {/* Resolved Blockers (collapsed) */}
        {resolvedBlockers.length > 0 && (
          <details className="group">
            <summary className="text-sm font-medium text-status-on-track flex items-center gap-2 cursor-pointer">
              <CheckCircle2 className="h-4 w-4" />
              Résolus ({resolvedBlockers.length})
            </summary>
            <div className="mt-2 space-y-2">
              {resolvedBlockers.map((blocker) => (
                <BlockerCard
                  key={blocker.id}
                  blocker={blocker}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  onDelete={() => handleDelete(blocker.id)}
                />
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Escalate Dialog */}
      <Dialog open={!!escalateDialog} onOpenChange={() => setEscalateDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Escalader l'obstacle</DialogTitle>
            <DialogDescription>
              À qui souhaitez-vous escalader cet obstacle?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nom ou email de la personne"
              value={escalateTo}
              onChange={(e) => setEscalateTo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleEscalate} disabled={isSubmitting || !escalateTo.trim()}>
              {isSubmitting ? 'Escalade...' : 'Escalader'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={!!resolveDialog} onOpenChange={() => setResolveDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Résoudre l'obstacle</DialogTitle>
            <DialogDescription>
              Comment cet obstacle a-t-il été résolu? (optionnel)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Description de la résolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleResolve} disabled={isSubmitting}>
              {isSubmitting ? 'Résolution...' : 'Marquer résolu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

type BlockerCardProps = {
  blocker: BlockerWithProfile
  getStatusIcon: (status: string) => React.ReactNode
  getStatusBadge: (status: string) => React.ReactNode
  onEscalate?: () => void
  onResolve?: () => void
  onDelete: () => void
}

function BlockerCard({
  blocker,
  getStatusIcon,
  getStatusBadge,
  onEscalate,
  onResolve,
  onDelete,
}: BlockerCardProps) {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getStatusIcon(blocker.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm">{blocker.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {blocker.wig.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4">
                      {blocker.reportedBy.avatarUrl && (
                        <AvatarImage src={blocker.reportedBy.avatarUrl} alt={blocker.reportedBy.fullName || ''} />
                      )}
                      <AvatarFallback className="text-[8px]">
                        {getInitials(blocker.reportedBy.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{blocker.reportedBy.fullName}</span>
                  </div>
                </div>
                {blocker.escalatedTo && (
                  <p className="text-xs text-brand-gold mt-1">
                    Escaladé à: {blocker.escalatedTo}
                  </p>
                )}
                {blocker.resolution && (
                  <p className="text-xs text-status-on-track mt-1">
                    Résolution: {blocker.resolution}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge(blocker.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {blocker.status === 'OPEN' && onEscalate && (
                      <DropdownMenuItem onClick={onEscalate}>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Escalader
                      </DropdownMenuItem>
                    )}
                    {blocker.status !== 'RESOLVED' && onResolve && (
                      <DropdownMenuItem onClick={onResolve}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Marquer résolu
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
