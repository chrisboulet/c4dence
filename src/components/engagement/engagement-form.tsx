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
import { createEngagement } from '@/app/actions/engagement'

type EngagementFormData = {
  description: string
}

type EngagementFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: number
  weekNumber: number
  onSuccess?: () => void
}

export function EngagementForm({
  open,
  onOpenChange,
  year,
  weekNumber,
  onSuccess,
}: EngagementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EngagementFormData>({
    defaultValues: {
      description: '',
    },
  })

  const onSubmit = async (data: EngagementFormData) => {
    if (!data.description.trim()) {
      setError("L'engagement est requis")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createEngagement({
      year,
      weekNumber,
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
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nouvel engagement</DialogTitle>
            <DialogDescription>
              Semaine {weekNumber} ({year}) — Que vous engagez-vous à accomplir?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">Engagement</Label>
              <Input
                id="description"
                placeholder="Ex: Appeler les 10 prospects chauds avant mercredi"
                {...register('description', { required: "L'engagement est requis" })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format recommandé: Verbe d'action + Objet + Délai
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
              {isSubmitting ? 'Enregistrement...' : "M'engager"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
