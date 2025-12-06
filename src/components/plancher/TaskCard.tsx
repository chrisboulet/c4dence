'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@prisma/client'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditTaskDialog } from './EditTaskDialog'
import { DeleteTaskDialog } from './DeleteTaskDialog'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

export function TaskCard({ task, isDragging, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          rounded-lg border bg-background p-3 cursor-grab active:cursor-grabbing
          hover:shadow-md transition-shadow
          ${isDragging ? 'shadow-lg rotate-2' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {!isDragging && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  setIsEditOpen(true)
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleteOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {onTaskUpdated && (
        <EditTaskDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          task={task}
          onTaskUpdated={onTaskUpdated}
        />
      )}

      {onTaskDeleted && (
        <DeleteTaskDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          task={task}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </>
  )
}
