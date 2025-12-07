'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LeadMeasure } from '@prisma/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createLeadMeasure, updateLeadMeasure } from '@/app/actions/lead-measure'
import { toast } from 'sonner'
import { ObjectiveSummary } from '@/types'

const indicatorSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    objectiveId: z.string().min(1, 'L\'objectif est requis'),
    targetPerWeek: z.coerce.number().min(0, 'La cible doit être positive').default(0),
    unit: z.string().min(1, 'L\'unité est requise'),
    assignedToId: z.string().optional(),
})

type IndicatorFormData = z.infer<typeof indicatorSchema>

interface IndicatorFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    indicator?: LeadMeasure | null
    objectives: ObjectiveSummary[]
    members: Array<{ id: string; profile: { id: string; fullName: string | null; avatarUrl: string | null } }>
    onSuccess: () => void
}

export function IndicatorForm({ open, onOpenChange, indicator, objectives, members, onSuccess }: IndicatorFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<IndicatorFormData>({
        resolver: zodResolver(indicatorSchema) as any,
        defaultValues: {
            name: indicator?.name || '',
            description: indicator?.description || '',
            objectiveId: indicator?.objectiveId || '',
            targetPerWeek: indicator?.targetPerWeek || 0,
            unit: indicator?.unit || '',
            assignedToId: indicator?.assignedToId || 'none',
        },
    })

    const onSubmit = async (data: IndicatorFormData) => {
        setIsSubmitting(true)
        try {
            const assignedToId = data.assignedToId === 'none' ? undefined : data.assignedToId

            let result
            if (indicator) {
                result = await updateLeadMeasure(indicator.id, {
                    ...data,
                    assignedToId,
                })
            } else {
                result = await createLeadMeasure({
                    ...data,
                    assignedToId,
                })
            }

            if (result.success) {
                toast.success(indicator ? 'Indicateur mis à jour' : 'Indicateur créé')
                onSuccess()
                onOpenChange(false)
                form.reset()
            } else {
                toast.error(result.error || 'Une erreur est survenue')
            }
        } catch (error) {
            console.error(error)
            toast.error('Erreur inattendue')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{indicator ? 'Modifier l\'indicateur' : 'Nouvel indicateur'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de l'indicateur</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: Appels de prospection" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="objectiveId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objectif lié</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!indicator}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un objectif" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {objectives.map((obj) => (
                                                <SelectItem key={obj.id} value={obj.id}>
                                                    {obj.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetPerWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cible Hebdo</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unité</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="ex: appels" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="assignedToId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Responsable</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Non assigné" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Non assigné</SelectItem>
                                            {members.map((m) => (
                                                <SelectItem key={m.id} value={m.profile.id}>
                                                    {m.profile.fullName || 'Membre'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Description optionnelle..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
