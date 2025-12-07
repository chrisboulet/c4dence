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
import { updateTask } from '@/app/actions/task'
import { getOrganizationMembers } from '@/app/actions/organization'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  urgency: z.enum(['HIGH', 'LOW']).optional(),
  businessImpact: z.enum(['HIGH', 'LOW']).optional(),
  dueDate: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  onTaskUpdated: (task: Task) => void
}

export function EditTaskDialog({ open, onOpenChange, task, onTaskUpdated }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState<Array<{ id: string; profile: { id: string; fullName: string | null; avatarUrl: string | null } }>>([])

  useEffect(() => {
    if (open && task.organizationId) {
      getOrganizationMembers(task.organizationId).then((result) => {
        if (result.success) {
          setMembers(result.data)
        }
      })
    }
  }, [open, task.organizationId])

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId || 'none',
      urgency: task.urgency || undefined,
      businessImpact: task.businessImpact || undefined,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : undefined,
    },
  })

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId || 'none',
      urgency: task.urgency || undefined,
      businessImpact: task.businessImpact || undefined,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : undefined,
    })
  }, [task, form])

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description || '')

    if (data.assignedToId && data.assignedToId !== 'none') {
      formData.append('assignedToId', data.assignedToId)
    }
    if (data.urgency) formData.append('urgency', data.urgency)
    if (data.businessImpact) formData.append('businessImpact', data.businessImpact)
    if (data.dueDate) formData.append('dueDate', data.dueDate)

    const result = await updateTask(task.id, formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success('Tâche modifiée')
      onTaskUpdated(result.data)
      onOpenChange(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la tâche
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
                    <Input {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
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
                    <FormLabel>Urgence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">🔴 Haute</SelectItem>
                        <SelectItem value="LOW">🔵 Basse</SelectItem>
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
                        <SelectItem value="HIGH">🔴 Fort</SelectItem>
                        <SelectItem value="LOW">🔵 Faible</SelectItem>
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
                      placeholder="Détails de la tâche..."
                      rows={4}
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
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
