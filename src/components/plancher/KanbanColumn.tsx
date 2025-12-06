'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@prisma/client'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  emoji: string
  tasks: Task[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: string) => void
}

export function KanbanColumn({ id, title, emoji, tasks, onTaskUpdated, onTaskDeleted }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-lg border bg-card p-4 transition-colors
        ${isOver ? 'border-primary bg-primary/5' : 'border-border'}
      `}
    >
      <div className="mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>{emoji}</span>
          <span>{title}</span>
          <span className="ml-auto text-sm text-muted-foreground">
            {tasks.length}
          </span>
        </h3>
      </div>

      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[200px]">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskUpdated={onTaskUpdated}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Aucune tâche
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
