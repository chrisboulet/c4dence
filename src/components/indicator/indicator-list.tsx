'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { IndicatorForm } from './indicator-form'
import { deleteLeadMeasure } from '@/app/actions/lead-measure'
import { toast } from 'sonner'
import { LeadMeasure } from '@prisma/client'
import { ObjectiveSummary } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type IndicatorWithRelations = LeadMeasure & {
    objective: { name: string },
    assignedTo: { fullName: string | null; avatarUrl: string | null } | null
}

interface IndicatorListProps {
    indicators: IndicatorWithRelations[]
    objectives: ObjectiveSummary[]
    members: Array<{ id: string; profile: { id: string; fullName: string | null; avatarUrl: string | null } }>
    onRefresh: () => void
}

export function IndicatorList({ indicators, objectives, members, onRefresh }: IndicatorListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingIndicator, setEditingIndicator] = useState<LeadMeasure | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet indicateur?')) return

        const result = await deleteLeadMeasure(id)
        if (result.success) {
            toast.success('Indicateur supprimé')
            onRefresh()
        } else {
            toast.error(result.error || 'Erreur lors de la suppression')
        }
    }

    const handleEdit = (indicator: LeadMeasure) => {
        setEditingIndicator(indicator)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setEditingIndicator(null)
        setIsFormOpen(true)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Indicateurs Prédictifs</CardTitle>
                        <CardDescription>
                            Liste globale des indicateurs de performance (Lead Measures)
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvel Indicateur
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {indicators.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Aucun indicateur trouvé. Créez-en un pour commencer à mesurer votre avancement.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Indicateur</TableHead>
                                <TableHead>Objectif</TableHead>
                                <TableHead>Cible / Unité</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {indicators.map((indicator) => (
                                <TableRow key={indicator.id}>
                                    <TableCell className="font-medium">
                                        {indicator.name}
                                        {indicator.description && (
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {indicator.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{indicator.objective.name}</TableCell>
                                    <TableCell>
                                        {indicator.targetPerWeek} {indicator.unit}/sem
                                    </TableCell>
                                    <TableCell>
                                        {indicator.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={indicator.assignedTo.avatarUrl || undefined} />
                                                    <AvatarFallback>{indicator.assignedTo.fullName?.[0] || '?'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{indicator.assignedTo.fullName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(indicator)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(indicator.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <IndicatorForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open)
                        if (!open) setEditingIndicator(null)
                    }}
                    indicator={editingIndicator}
                    objectives={objectives}
                    members={members}
                    onSuccess={onRefresh}
                />
            </CardContent>
        </Card>
    )
}
