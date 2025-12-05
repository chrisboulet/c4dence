'use client'

import { useState } from 'react'
import { TriageCard } from '@/components/dashboard/plancher/TriageCard'
import { TriageMatrix } from '@/components/dashboard/plancher/TriageMatrix'
import { categorizeTask } from '@/lib/triage'
import { Urgency, BusinessImpact, TaskCategory } from '@prisma/client'
import { Separator } from '@/components/ui/separator'

// Mock data
const MOCK_TASKS = [
    { id: '1', title: 'Répondre au client X', description: 'Urgent car il attend depuis 2 jours', status: 'TO_TRIAGE' },
    { id: '2', title: 'Mettre à jour la documentation', description: 'Pas urgent mais important', status: 'TO_TRIAGE' },
    { id: '3', title: 'Commander des fournitures', description: 'Plus de papier', status: 'TO_TRIAGE' },
]

export default function TriagePage() {
    const [tasks, setTasks] = useState(MOCK_TASKS)
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
    const [activeCategory, setActiveCategory] = useState<TaskCategory | undefined>(undefined)

    const currentTask = tasks[currentTaskIndex]

    const handleTriage = (taskId: string, urgency: Urgency, impact: BusinessImpact) => {
        const category = categorizeTask(urgency, impact)
        setActiveCategory(category)

        // Simulate API call delay
        setTimeout(() => {
            // Move to next task
            if (currentTaskIndex < tasks.length - 1) {
                setCurrentTaskIndex(prev => prev + 1)
                setActiveCategory(undefined)
            } else {
                // All done
                alert("Triage terminé pour cette session !")
            }
        }, 1000)
    }

    return (
        <div className="container mx-auto p-6 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Triage</h1>
                <p className="text-muted-foreground">
                    Catégorisez vos tâches pour déterminer leur priorité.
                </p>
            </div>

            <Separator className="my-6" />

            {currentTask ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-start">
                    <div className="flex justify-center">
                        <TriageCard
                            task={currentTask}
                            onTriage={(id, u, i) => {
                                const cat = categorizeTask(u, i)
                                setActiveCategory(cat)
                                handleTriage(id, u, i)
                            }}
                        />
                    </div>

                    <div className="flex justify-center items-center h-full">
                        <TriageMatrix activeCategory={activeCategory} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-2xl font-semibold mb-2">🎉 Tout est trié !</div>
                    <p className="text-muted-foreground">Vous pouvez retourner au Flux pour traiter vos tâches.</p>
                </div>
            )}
        </div>
    )
}
