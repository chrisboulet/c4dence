'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Task, TaskStatus } from '@prisma/client'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { AddTaskDialog } from './AddTaskDialog'
import { updateTaskStatus } from '@/app/actions/task'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface KanbanBoardProps {
  initialTasks: Task[]
  organizationId: string
}

const COLUMNS = [
  { id: 'TO_TRIAGE' as TaskStatus, title: 'À trier', emoji: '📥' },
  { id: 'TODO' as TaskStatus, title: 'À faire', emoji: '📋' },
  { id: 'IN_PROGRESS' as TaskStatus, title: 'En cours', emoji: '⚡' },
  { id: 'DONE' as TaskStatus, title: 'Terminé', emoji: '✅' },
]

export function KanbanBoard({ initialTasks, organizationId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    // Server update
    const result = await updateTaskStatus(taskId, newStatus)

    if (!result.success) {
      // Rollback on error
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: task.status } : t
      ))
      toast.error(result.error || 'Erreur lors de la mise à jour')
    } else {
      toast.success('Tâche déplacée')
    }
  }

  const handleTaskAdded = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {tasks.length} tâche{tasks.length > 1 ? 's' : ''} au total
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              emoji={column.emoji}
              tasks={tasks.filter(t => t.status === column.id)}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        organizationId={organizationId}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  )
}
