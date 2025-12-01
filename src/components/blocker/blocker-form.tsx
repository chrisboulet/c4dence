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
import { getWigs } from '@/app/actions/wig'
import type { WigSummary } from '@/types'

type BlockerFormData = {
  wigId: string
  description: string
}

type BlockerFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  wigId?: string // Pré-sélection si on est sur une page WIG
  onSuccess?: () => void
}

export function BlockerForm({
  open,
  onOpenChange,
  wigId,
  onSuccess,
}: BlockerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wigs, setWigs] = useState<WigSummary[]>([])

  // Charger les WIGs actifs
  useEffect(() => {
    async function fetchWigs() {
      const result = await getWigs()
      if (result.success) {
        // Filtrer les WIGs non archivés
        setWigs(result.data.filter(w => w.status !== 'ACHIEVED'))
      }
    }
    if (open) {
      fetchWigs()
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
      wigId: wigId || '',
      description: '',
    },
  })

  const onSubmit = async (data: BlockerFormData) => {
    if (!data.wigId) {
      setError('Veuillez sélectionner un WIG')
      return
    }
    if (!data.description.trim()) {
      setError("La description de l'obstacle est requise")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createBlocker({
      wigId: data.wigId,
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
              4DX Phase "Clear" : Identifiez les obstacles qui bloquent l'avancement de vos WIGs.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Sélection du WIG */}
            <div className="grid gap-2">
              <Label htmlFor="wigId">WIG impacté</Label>
              <Controller
                name="wigId"
                control={control}
                rules={{ required: 'Veuillez sélectionner un WIG' }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!wigId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un WIG" />
                    </SelectTrigger>
                    <SelectContent>
                      {wigs.map((wig) => (
                        <SelectItem key={wig.id} value={wig.id}>
                          {wig.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.wigId && (
                <p className="text-sm text-red-500">{errors.wigId.message}</p>
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
                Décrivez clairement l'obstacle et son impact sur l'atteinte du WIG.
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
