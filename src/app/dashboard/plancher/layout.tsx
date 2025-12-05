import { SubNav } from "@/components/layout/sub-nav"

const navItems = [
    { name: 'Flux (Kanban)', href: '/dashboard/plancher/flux' },
    { name: 'Triage', href: '/dashboard/plancher/triage' },
    { name: 'Métriques', href: '/dashboard/plancher/metriques' },
]

export default function PlancherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Le Plancher</h1>
                <p className="text-muted-foreground">
                    Gestion opérationnelle et flux de travail.
                </p>
            </div>

            <SubNav items={navItems} />

            {children}
        </div>
    )
}
