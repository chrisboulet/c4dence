'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createObjective, updateObjective } from '@/app/actions/objective'
import { getOrganizationMembers } from '@/app/actions/organization'
import { useOrganization } from '@/components/providers/organization-provider'
import type { Objective } from '@prisma/client'

type ObjectiveFormData = {
  name: string
  description: string
  startValue: string
  targetValue: string
  unit: string
  startDate: string
  endDate: string
  ownerId: string
}

type OrgMember = {
  id: string
  profile: { id: string; email: string; fullName: string | null; avatarUrl: string | null }
}

type ObjectiveFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  objective?: Objective | null
  onSuccess?: () => void
}

export function ObjectiveForm({ open, onOpenChange, objective, onSuccess }: ObjectiveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const { currentOrg } = useOrganization()

  const isEditing = !!objective

  // Charger les membres de l'organisation
  useEffect(() => {
    async function fetchMembers() {
      if (!currentOrg?.organizationId) return
      const result = await getOrganizationMembers(currentOrg.organizationId)
      if (result.success) {
        setMembers(result.data)
      }
    }
    if (open) {
      fetchMembers()
    }
  }, [currentOrg?.organizationId, open])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ObjectiveFormData>({
    defaultValues: objective
      ? {
          name: objective.name,
          description: objective.description || '',
          startValue: String(objective.startValue),
          targetValue: String(objective.targetValue),
          unit: objective.unit,
          startDate: format(new Date(objective.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(objective.endDate), 'yyyy-MM-dd'),
          ownerId: (objective as Objective & { ownerId?: string | null }).ownerId || '',
        }
      : {
          name: '',
          description: '',
          startValue: '0',
          targetValue: '0',
          unit: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: '',
          ownerId: '',
        },
  })

  const onSubmit = async (data: ObjectiveFormData) => {
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
      ownerId: data.ownerId || undefined,
    }

    const result = isEditing
      ? await updateObjective({ id: objective.id, ...input })
      : await createObjective(input)

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
              {isEditing ? "Modifier l'Objectif" : 'Nouvel Objectif'}
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
              <Label htmlFor="name">Nom de l'Objectif</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="ownerId">Responsable</Label>
              <Controller
                name="ownerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.profile.id} value={member.profile.id}>
                          {member.profile.fullName || member.profile.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Il est recommandé d'assigner un responsable clairement identifié
              </p>
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
                : "Créer l'Objectif"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
