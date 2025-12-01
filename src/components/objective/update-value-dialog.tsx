'use client'

import { useState } from 'react'
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
import { updateObjective } from '@/app/actions/objective'

type UpdateValueDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectiveId: string
  currentValue: number
  unit: string
  onSuccess?: () => void
}

export function UpdateValueDialog({
  open,
  onOpenChange,
  objectiveId,
  currentValue,
  unit,
  onSuccess,
}: UpdateValueDialogProps) {
  const [value, setValue] = useState(String(currentValue))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setError('Valeur invalide')
      setIsSubmitting(false)
      return
    }

    const result = await updateObjective({ id: objectiveId, currentValue: numValue })
    setIsSubmitting(false)

    if (result.success) {
      onOpenChange(false)
      onSuccess?.()
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mettre à jour la valeur</DialogTitle>
            <DialogDescription>
              Entrez la nouvelle valeur actuelle de votre objectif.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="value">Valeur actuelle ({unit})</Label>
              <Input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
