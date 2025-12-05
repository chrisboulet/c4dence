import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { calculateStrategicRatio } from "@/lib/time-allocation"
import { cn } from "@/lib/utils"

interface TimeAllocationGaugeProps {
    floorHours: number
    pillarsHours: number
    className?: string
}

export function TimeAllocationGauge({ floorHours, pillarsHours, className }: TimeAllocationGaugeProps) {
    const pillarsPercent = calculateStrategicRatio({ floorHours, pillarsHours })
    const isWarning = pillarsPercent < 10

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Allocation Temps Stratégique
                </CardTitle>
                <span className={cn("text-2xl font-bold", isWarning ? "text-red-500" : "text-green-500")}>
                    {pillarsPercent}%
                </span>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Plancher ({floorHours}h)</span>
                        <span>Piliers ({pillarsHours}h)</span>
                    </div>
                    <Progress
                        value={pillarsPercent}
                        className={cn("h-2", isWarning ? "bg-red-100" : "bg-green-100")}
                        indicatorClassName={isWarning ? "bg-red-500" : "bg-green-500"}
                    />
                    <p className="text-xs text-muted-foreground pt-2">
                        {isWarning
                            ? "⚠️ Attention : Le temps stratégique est sous la barre des 10%."
                            : "✅ Excellent : Le temps stratégique est protégé."}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
