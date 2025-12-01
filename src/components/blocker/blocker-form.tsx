'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { createBlocker } from '@/app/actions/blocker'
import { getObjectives } from '@/app/actions/objective'
import type { ObjectiveSummary } from '@/types'

type BlockerFormData = {
  objectiveId: string
  description: string
}

type BlockerFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectiveId?: string // Pré-sélection si on est sur une page Objectif
  onSuccess?: () => void
}

export function BlockerForm({
  open,
  onOpenChange,
  objectiveId,
  onSuccess,
}: BlockerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [objectives, setObjectives] = useState<ObjectiveSummary[]>([])

  // Charger les Objectifs actifs
  useEffect(() => {
    async function fetchObjectives() {
      const result = await getObjectives()
      if (result.success) {
        // Filtrer les Objectifs non archivés
        setObjectives(result.data.filter(o => o.status !== 'ACHIEVED'))
      }
    }
    if (open) {
      fetchObjectives()
    }
  }, [open])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BlockerFormData>({
    defaultValues: {
      objectiveId: objectiveId || '',
      description: '',
    },
  })

  const onSubmit = async (data: BlockerFormData) => {
    if (!data.objectiveId) {
      setError('Veuillez sélectionner un Objectif')
      return
    }
    if (!data.description.trim()) {
      setError("La description de l'obstacle est requise")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createBlocker({
      objectiveId: data.objectiveId,
      description: data.description,
    })

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
            <DialogTitle>Signaler un obstacle</DialogTitle>
            <DialogDescription>
              Identifiez les obstacles qui bloquent l'avancement de vos Objectifs.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Sélection de l'Objectif */}
            <div className="grid gap-2">
              <Label htmlFor="objectiveId">Objectif impacté</Label>
              <Controller
                name="objectiveId"
                control={control}
                rules={{ required: 'Veuillez sélectionner un Objectif' }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!objectiveId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un Objectif" />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map((objective) => (
                        <SelectItem key={objective.id} value={objective.id}>
                          {objective.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.objectiveId && (
                <p className="text-sm text-red-500">{errors.objectiveId.message}</p>
              )}
            </div>

            {/* Description de l'obstacle */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description de l'obstacle</Label>
              <Textarea
                id="description"
                placeholder="Ex: Budget marketing gelé jusqu'à Q2, Ressource clé en congé..."
                rows={3}
                {...register('description', { required: "La description est requise" })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Décrivez clairement l'obstacle et son impact sur l'atteinte de l'Objectif.
              </p>
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
              {isSubmitting ? 'Enregistrement...' : "Signaler l'obstacle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
