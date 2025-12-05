import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TimeAllocationGaugeProps {
    floorHours: number
    pillarsHours: number
}

export function TimeAllocationGauge({ floorHours, pillarsHours }: TimeAllocationGaugeProps) {
    const totalHours = floorHours + pillarsHours
    const pillarsPercent = totalHours > 0 ? Math.round((pillarsHours / totalHours) * 100) : 0
    const floorPercent = 100 - pillarsPercent

    const isHealthy = pillarsPercent >= 10

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                    Allocation Temps
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">🎵 Plancher ({floorPercent}%)</span>
                        <span className={cn(
                            "font-medium",
                            isHealthy ? "text-green-600" : "text-red-600"
                        )}>
                            🎯 Piliers ({pillarsPercent}%)
                        </span>
                    </div>

                    <Progress value={pillarsPercent} className="h-2" />

                    {!isHealthy && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                            ⚠️ Attention : Temps stratégique insuffisant (&lt;10%)
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
