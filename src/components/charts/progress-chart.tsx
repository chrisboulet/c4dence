'use client'

import { AreaChart, Card, Title, Text } from '@tremor/react'

type DataPoint = {
  week: string
  Réel: number
  Cible: number
}

type ProgressChartProps = {
  title: string
  data: DataPoint[]
  unit: string
  startValue: number
  targetValue: number
}

export function ProgressChart({ title, data, unit, startValue, targetValue }: ProgressChartProps) {
  const valueFormatter = (value: number) => {
    if (unit === '$' || unit === 'M$') {
      return `${value.toLocaleString('fr-CA')} ${unit}`
    }
    if (unit === '%') {
      return `${value}%`
    }
    return `${value} ${unit}`
  }

  return (
    <Card className="bg-card border-border">
      <Title className="text-foreground">{title}</Title>
      <Text className="text-muted-foreground">
        Progression réelle vs cible linéaire
      </Text>
      <AreaChart
        className="mt-4 h-72"
        data={data}
        index="week"
        categories={['Réel', 'Cible']}
        colors={['cyan', 'violet']}
        valueFormatter={valueFormatter}
        showLegend={true}
        showGridLines={true}
        showAnimation={true}
        curveType="monotone"
        yAxisWidth={80}
      />
    </Card>
  )
}
