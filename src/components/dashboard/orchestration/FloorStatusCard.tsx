import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FloorStatusCardProps {
    status: 'CONTROLLED' | 'OVERFLOWING'
}

export function FloorStatusCard({ status }: FloorStatusCardProps) {
    const isControlled = status === 'CONTROLLED'

    return (
        <Card className={cn(
            "border-l-4",
            isControlled ? "border-l-green-500" : "border-l-red-500"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Statut Plancher
                </CardTitle>
                <span className="text-2xl">{isControlled ? '🟢' : '🔴'}</span>
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "text-2xl font-bold",
                    isControlled ? "text-green-600" : "text-red-600"
                )}>
                    {isControlled ? 'SOUS CONTRÔLE' : 'DÉBORDEMENT'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {isControlled
                        ? "Le tourbillon est maîtrisé"
                        : "Action requise immédiate"}
                </p>
            </CardContent>
        </Card>
    )
}
