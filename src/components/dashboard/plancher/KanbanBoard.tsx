'use client'

import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    closestCorners
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Task {
    id: string
    title: string
    description: string | null
    status: string
    organizationId: string
    createdAt: Date
    updatedAt: Date
}

interface KanbanBoardProps {
    tasks: Task[]
}

const COLUMNS = [
    { id: 'TO_TRIAGE', title: 'À TRIER', color: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'TODO', title: 'À FAIRE', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'IN_PROGRESS', title: 'EN COURS', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'DONE', title: 'TERMINÉ', color: 'bg-green-500/10 text-green-500' },
]

function DraggableTask({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: { task }
    })

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className={cn("touch-none", isDragging && "opacity-50")}>
            <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium leading-none">
                        {task.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {task.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-muted-foreground">
                            {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function DroppableColumn({ column, tasks }: { column: typeof COLUMNS[0], tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div ref={setNodeRef} className="flex h-full w-80 min-w-80 flex-col rounded-lg border bg-secondary/30">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className={cn("ml-2", column.color)}>
                        {tasks.length}
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 pb-4">
                <div className="flex flex-col gap-3">
                    {tasks.map((task) => (
                        <DraggableTask key={task.id} task={task} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [activeTask, setActiveTask] = useState<Task | null>(null)

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            // If dropped over a column
            const columnId = over.id as string

            // Update local state
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === active.id ? { ...t, status: columnId } : t
                )
            )

            // TODO: Call Server Action to update status in DB
            console.log(`Moved task ${active.id} to ${columnId}`)
        }

        setActiveTask(null)
    }

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status)
    }

    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((column) => (
                    <DroppableColumn
                        key={column.id}
                        column={column}
                        tasks={getTasksByStatus(column.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <Card className="cursor-grabbing border-primary shadow-xl rotate-2">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium leading-none">
                                {activeTask.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {activeTask.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {activeTask.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
