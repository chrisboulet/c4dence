'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createEngagement, getMyEngagementsCount } from '@/app/actions/engagement'

const MAX_ENGAGEMENTS_PER_WEEK = 2

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
  const [engagementCount, setEngagementCount] = useState(0)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [pendingData, setPendingData] = useState<EngagementFormData | null>(null)

  // Charger le nombre d'engagements à l'ouverture
  useEffect(() => {
    async function fetchCount() {
      const result = await getMyEngagementsCount(year, weekNumber)
      if (result.success) {
        setEngagementCount(result.data)
      }
    }
    if (open) {
      fetchCount()
    }
  }, [open, year, weekNumber])

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

  const submitEngagement = async (data: EngagementFormData) => {
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

  const onSubmit = async (data: EngagementFormData) => {
    if (!data.description.trim()) {
      setError("L'engagement est requis")
      return
    }

    // 4DX: Vérifier la limite de 2 engagements par semaine
    if (engagementCount >= MAX_ENGAGEMENTS_PER_WEEK) {
      setPendingData(data)
      setShowLimitWarning(true)
      return
    }

    await submitEngagement(data)
  }

  const handleConfirmOverLimit = async () => {
    if (pendingData) {
      setShowLimitWarning(false)
      await submitEngagement(pendingData)
      setPendingData(null)
    }
  }

  return (
    <>
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

              {/* 4DX Warning: Max 2 engagements per week */}
              {engagementCount >= MAX_ENGAGEMENTS_PER_WEEK && (
                <Alert variant="warning">
                  <AlertIcon variant="warning" />
                  <AlertTitle>Limite 4DX atteinte</AlertTitle>
                  <AlertDescription>
                    Vous avez déjà {engagementCount} engagement{engagementCount > 1 ? 's' : ''} cette semaine.
                    La méthodologie 4DX recommande <strong>1-2 engagements maximum</strong> par personne
                    pour maximiser les chances de succès.
                  </AlertDescription>
                </Alert>
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

      {/* Confirmation dialog when over limit */}
      <AlertDialog open={showLimitWarning} onOpenChange={setShowLimitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-at-risk" />
              Limite d'engagements dépassée
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez déjà {engagementCount} engagement{engagementCount > 1 ? 's' : ''} cette semaine.
              <br /><br />
              La méthodologie 4DX recommande de se limiter à <strong>1-2 engagements</strong> par
              semaine pour maximiser votre focus et vos chances de succès.
              <br /><br />
              Êtes-vous sûr de vouloir ajouter un engagement supplémentaire?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingData(null)}>
              Non, annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverLimit}>
              Oui, ajouter quand même
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
