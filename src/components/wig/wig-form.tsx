'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
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
import { createWig, updateWig } from '@/app/actions/wig'
import type { Wig } from '@prisma/client'

type WigFormData = {
  name: string
  description: string
  startValue: string
  targetValue: string
  unit: string
  startDate: string
  endDate: string
}

type WigFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  wig?: Wig | null
  onSuccess?: () => void
}

export function WigForm({ open, onOpenChange, wig, onSuccess }: WigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!wig

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WigFormData>({
    defaultValues: wig
      ? {
          name: wig.name,
          description: wig.description || '',
          startValue: String(wig.startValue),
          targetValue: String(wig.targetValue),
          unit: wig.unit,
          startDate: format(new Date(wig.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(wig.endDate), 'yyyy-MM-dd'),
        }
      : {
          name: '',
          description: '',
          startValue: '0',
          targetValue: '0',
          unit: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: '',
        },
  })

  const onSubmit = async (data: WigFormData) => {
    if (!data.name.trim()) {
      setError('Le nom est requis')
      return
    }
    if (!data.endDate) {
      setError("La date d'échéance est requise")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const input = {
      name: data.name,
      description: data.description || undefined,
      startValue: parseFloat(data.startValue) || 0,
      targetValue: parseFloat(data.targetValue) || 0,
      unit: data.unit,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    }

    const result = isEditing
      ? await updateWig({ id: wig.id, ...input })
      : await createWig(input)

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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier le WIG' : 'Nouveau WIG'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifiez les informations de votre objectif stratégique.'
                : 'Définissez un nouvel objectif stratégique mesurable.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nom du WIG</Label>
              <Input
                id="name"
                placeholder="Ex: Augmenter le CA de 2.5M$ à 3.2M$"
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
                placeholder="Contexte et détails additionnels"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startValue">Valeur initiale</Label>
                <Input
                  id="startValue"
                  type="number"
                  step="any"
                  {...register('startValue')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetValue">Valeur cible</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="any"
                  {...register('targetValue')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  placeholder="$, %, clients"
                  {...register('unit')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">Date d'échéance</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate', { required: "La date d'échéance est requise" })}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
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
                : 'Créer le WIG'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
