'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { createTask } from '@/app/actions/task'
import { getOrganizationMembers } from '@/app/actions/organization'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  assignedToId: z.string().optional(), // "none" or uuid
  urgency: z.enum(['HIGH', 'LOW']).optional(),
  businessImpact: z.enum(['HIGH', 'LOW']).optional(),
  dueDate: z.string().optional(), // YYYY-MM-DD
})

type TaskFormData = z.infer<typeof taskSchema>

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  onTaskAdded: (task: Task) => void
}

export function AddTaskDialog({ open, onOpenChange, organizationId, onTaskAdded }: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState<Array<{ id: string; profile: { id: string; fullName: string | null; avatarUrl: string | null } }>>([])

  // Fetch members when dialog opens
  useEffect(() => {
    if (open && organizationId) {
      getOrganizationMembers(organizationId).then((result) => {
        if (result.success) {
          setMembers(result.data)
        } else {
          console.error('Failed to fetch members:', result.error)
        }
      })
    }
  }, [open, organizationId])

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      urgency: undefined,
      businessImpact: undefined,
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    console.log('Soumission du formulaire...', data)

    if (!organizationId) {
      toast.error('Erreur: Organisation ID manquant')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('organizationId', organizationId)

      if (data.assignedToId && data.assignedToId !== 'none') {
        formData.append('assignedToId', data.assignedToId)
      }
      if (data.urgency) {
        formData.append('urgency', data.urgency)
      }
      if (data.businessImpact) {
        formData.append('businessImpact', data.businessImpact)
      }
      if (data.dueDate) {
        formData.append('dueDate', data.dueDate)
      }

      const result = await createTask(formData)

      if (result.success) {
        toast.success('Tâche créée avec succès')
        onTaskAdded(result.data)
        form.reset()
        onOpenChange(false)
      } else {
        console.error('Erreur serveur:', result.error)
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (e) {
      console.error('Erreur client:', e)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
          <DialogDescription>
            Ajoutez une tâche au plancher et triez-la immédiatement.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Préparer la présentation client" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Non assigné" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Non assigné</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.profile.id || member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.profile.avatarUrl || undefined} />
                                <AvatarFallback>{member.profile.fullName?.[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <span>{member.profile.fullName || 'Membre'}</span>
                            </div>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Échéance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-secondary/20">
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgence (Délai)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">🔴 Haute (heures)</SelectItem>
                        <SelectItem value="LOW">🔵 Basse (jours)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Business</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">🔴 Fort (Bloquant)</SelectItem>
                        <SelectItem value="LOW">🔵 Faible (Irritant)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Détails supplémentaires..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer la tâche'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
