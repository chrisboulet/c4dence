'use client'

import { Card, Title, AreaChart } from '@tremor/react'

interface ChartData {
    date: string
    completed: number
    added: number
}

interface FloorVelocityChartProps {
    data: ChartData[]
}

export function FloorVelocityChart({ data }: FloorVelocityChartProps) {
    return (
        <Card>
            <Title>Vélocité du Plancher</Title>
            <AreaChart
                className="h-72 mt-4"
                data={data}
                index="date"
                categories={["completed", "added"]}
                colors={["emerald", "red"]}
                yAxisWidth={40}
            />
        </Card>
    )
}
