import { SubNav } from "@/components/layout/sub-nav"

const navItems = [
    { name: 'Objectifs', href: '/dashboard/piliers/objectifs' },
    { name: 'Indicateurs', href: '/dashboard/piliers/indicateurs' },
    { name: 'Scoreboard', href: '/dashboard/piliers/scoreboard' },
]

export default function PiliersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Les 4 Piliers</h1>
                <p className="text-muted-foreground">
                    Exécution stratégique et objectifs prioritaires.
                </p>
            </div>

            <SubNav items={navItems} />

            {children}
        </div>
    )
}
