import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/plancher/KanbanBoard'
import { getCurrentOrganizationId } from '@/lib/data/organization'
import { getTasks } from '@/app/actions/task'

export default async function FluxPage() {
    const organizationId = await getCurrentOrganizationId()

    if (!organizationId) {
        redirect('/onboarding')
    }

    const result = await getTasks(organizationId)
    const tasks = result.success ? result.data || [] : []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">🎵 Le Plancher - Flux</h1>
                <p className="text-muted-foreground">Gestion des tâches opérationnelles</p>
            </div>

            <KanbanBoard initialTasks={tasks} organizationId={organizationId} />
        </div>
    )
}
