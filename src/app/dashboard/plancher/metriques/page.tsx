'use client'

import { FloorVelocityChart } from "@/components/dashboard/plancher/FloorVelocityChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for the chart
const mockChartData = [
    { date: 'Semaine 45', completed: 12, added: 15 },
    { date: 'Semaine 46', completed: 18, added: 14 },
    { date: 'Semaine 47', completed: 15, added: 12 },
    { date: 'Semaine 48', completed: 22, added: 18 },
]

export default function MetriquesPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Vélocité du Plancher</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FloorVelocityChart data={mockChartData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
