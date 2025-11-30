'use client'

import { BarChart, Card, Title, Text } from '@tremor/react'

type DataPoint = {
  week: string
  Réalisé: number
  Cible: number
}

type LeadMeasureChartProps = {
  title: string
  data: DataPoint[]
  unit: string
}

export function LeadMeasureChart({ title, data, unit }: LeadMeasureChartProps) {
  const valueFormatter = (value: number) => `${value} ${unit}`

  return (
    <Card className="bg-card border-border">
      <Title className="text-foreground">{title}</Title>
      <Text className="text-muted-foreground">
        Performance hebdomadaire vs cible
      </Text>
      <BarChart
        className="mt-4 h-48"
        data={data}
        index="week"
        categories={['Réalisé', 'Cible']}
        colors={['cyan', 'slate']}
        valueFormatter={valueFormatter}
        showLegend={true}
        showAnimation={true}
        yAxisWidth={48}
      />
    </Card>
  )
}
