'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { categorizeTask } from '@/lib/triage'
import { Urgency, BusinessImpact } from '@prisma/client'

interface Task {
    id: string
    title: string
    description: string | null
    status: string
}

interface TriageCardProps {
    task: Task
    onTriage: (taskId: string, urgency: Urgency, impact: BusinessImpact) => void
}

export function TriageCard({ task, onTriage }: TriageCardProps) {
    const [urgency, setUrgency] = useState<Urgency>('LOW')
    const [impact, setImpact] = useState<BusinessImpact>('LOW')

    const category = categorizeTask(urgency, impact)

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Urgence (Temps)</label>
                    <div className="flex gap-2">
                        <Button
                            variant={urgency === 'HIGH' ? 'destructive' : 'outline'}
                            onClick={() => setUrgency('HIGH')}
                            className="flex-1"
                            aria-label="High Urgency"
                        >
                            🔥 Haute
                        </Button>
                        <Button
                            variant={urgency === 'LOW' ? 'secondary' : 'outline'}
                            onClick={() => setUrgency('LOW')}
                            className="flex-1"
                            aria-label="Low Urgency"
                        >
                            🧊 Basse
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Impact (Business)</label>
                    <div className="flex gap-2">
                        <Button
                            variant={impact === 'HIGH' ? 'default' : 'outline'}
                            onClick={() => setImpact('HIGH')}
                            className="flex-1"
                            aria-label="High Impact"
                        >
                            💎 Haut
                        </Button>
                        <Button
                            variant={impact === 'LOW' ? 'secondary' : 'outline'}
                            onClick={() => setImpact('LOW')}
                            className="flex-1"
                            aria-label="Low Impact"
                        >
                            🍂 Bas
                        </Button>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Catégorie suggérée</p>
                    <Badge className="text-lg px-4 py-1">
                        {category}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => onTriage(task.id, urgency, impact)}
                >
                    Valider le Triage
                </Button>
            </CardFooter>
        </Card>
    )
}
