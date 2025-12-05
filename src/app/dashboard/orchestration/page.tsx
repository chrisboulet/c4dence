import { FloorStatusCard } from "@/components/dashboard/orchestration/FloorStatusCard"
import { PillarsStatusCard } from "@/components/dashboard/orchestration/PillarsStatusCard"
import { TimeAllocationGauge } from "@/components/dashboard/orchestration/TimeAllocationGauge"
import { Separator } from "@/components/ui/separator"
import { getTimeAllocation } from "@/lib/data/time-allocation"
import { getCurrentOrganizationId } from "@/lib/data/organization"

export default async function OrchestrationPage() {
    const organizationId = await getCurrentOrganizationId()

    // Default values if no org or data
    let allocation = { floorHours: 0, pillarsHours: 0 }

    if (organizationId) {
        const data = await getTimeAllocation(organizationId)
        allocation = data
    }

    // Mock data for other cards (Phase 9/10)
    const floorStatus = 'CONTROLLED'
    const pillarsStatus = 'AT_RISK'

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">🎼 Orchestration</h1>
                    <p className="text-muted-foreground">
                        Vue d'ensemble et équilibre des rythmes
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* CadenceModeSelector placeholder */}
                    <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        Mode A (Unifié)
                    </span>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FloorStatusCard status={floorStatus} />
                <PillarsStatusCard status={pillarsStatus} />
                <TimeAllocationGauge
                    floorHours={allocation.floorHours}
                    pillarsHours={allocation.pillarsHours}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* AlertsSection placeholder */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold mb-4">⚠️ Alertes Actives</h3>
                    <p className="text-sm text-muted-foreground">Aucune alerte critique.</p>
                </div>

                {/* Quick Actions / Sync placeholder */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold mb-4">📅 Prochaine Synchronisation</h3>
                    <p className="text-sm text-muted-foreground">Lundi 9:00 (Mode A)</p>
                </div>
            </div>
        </div>
    )
}

