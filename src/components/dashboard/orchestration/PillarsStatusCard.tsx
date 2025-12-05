import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PillarsStatusCardProps {
    status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'ACHIEVED'
}

export function PillarsStatusCard({ status }: PillarsStatusCardProps) {
    const isVictory = status === 'ON_TRACK' || status === 'ACHIEVED'

    // Mapping status to colors using project CSS variables/classes
    const statusColor = isVictory ? "text-success" : "text-warning"
    const borderColor = isVictory ? "border-l-success" : "border-l-warning"
    const icon = isVictory ? '🏆' : '⚠️'
    const text = isVictory ? 'VICTOIRE EN VUE' : 'DANGER'
    const description = isVictory
        ? "On progresse selon la trajectoire"
        : "Déviation détectée, correction requise"

    return (
        <Card className={cn(
            "border-l-4",
            borderColor
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Statut Piliers
                </CardTitle>
                <span className="text-2xl">{icon}</span>
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "text-2xl font-bold",
                    statusColor
                )}>
                    {text}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
