'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createLeadMeasure, updateLeadMeasure } from '@/app/actions/lead-measure'
import type { LeadMeasure } from '@prisma/client'

type LeadMeasureFormData = {
  name: string
  description: string
  targetPerWeek: string
  unit: string
}

type LeadMeasureFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  wigId: string
  leadMeasure?: LeadMeasure | null
  onSuccess?: () => void
}

export function LeadMeasureForm({
  open,
  onOpenChange,
  wigId,
  leadMeasure,
  onSuccess,
}: LeadMeasureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!leadMeasure

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadMeasureFormData>({
    defaultValues: leadMeasure
      ? {
          name: leadMeasure.name,
          description: leadMeasure.description || '',
          targetPerWeek: String(leadMeasure.targetPerWeek),
          unit: leadMeasure.unit,
        }
      : {
          name: '',
          description: '',
          targetPerWeek: '0',
          unit: '',
        },
  })

  const onSubmit = async (data: LeadMeasureFormData) => {
    if (!data.name.trim()) {
      setError('Le nom est requis')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const input = {
      name: data.name,
      description: data.description || undefined,
      targetPerWeek: parseFloat(data.targetPerWeek) || 0,
      unit: data.unit,
    }

    const result = isEditing
      ? await updateLeadMeasure(leadMeasure.id, input)
      : await createLeadMeasure({ wigId, ...input })

    setIsSubmitting(false)

    if (result.success) {
      reset()
      onOpenChange(false)
      onSuccess?.()
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier la mesure' : 'Nouvelle mesure prédictive'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifiez les paramètres de cette mesure prédictive.'
                : 'Définissez une action influençable et prédictive du résultat.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la mesure</Label>
              <Input
                id="name"
                placeholder="Ex: Appels de prospection"
                {...register('name', { required: 'Le nom est requis' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                placeholder="Appels sortants vers prospects qualifiés"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetPerWeek">Cible hebdomadaire</Label>
                <Input
                  id="targetPerWeek"
                  type="number"
                  step="any"
                  placeholder="50"
                  {...register('targetPerWeek')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  placeholder="appels, démos, $"
                  {...register('unit')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Enregistrement...'
                : isEditing
                ? 'Enregistrer'
                : 'Créer la mesure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
