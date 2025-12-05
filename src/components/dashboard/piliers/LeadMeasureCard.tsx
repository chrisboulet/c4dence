import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LeadMeasure, Profile } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"

interface LeadMeasureWithRelations extends LeadMeasure {
    assignedTo: Pick<Profile, 'fullName' | 'avatarUrl'> | null
    currentWeekValue?: number | null
}

interface LeadMeasureCardProps {
    measure: LeadMeasureWithRelations
    /** Callback triggered when the value is updated (on blur) */
    onUpdate?: (id: string, value: number) => void
    className?: string
}

/**
 * LeadMeasureCard
 * 
 * Displays a lead measure card with a progress bar and an input for the current week's value.
 * Allows inline editing of the value, which commits on blur.
 */
export function LeadMeasureCard({ measure, onUpdate, className }: LeadMeasureCardProps) {
    // Local state to manage input value before committing
    const [value, setValue] = useState(measure.currentWeekValue?.toString() || "")

    // Sync local state with prop if it changes externally
    useEffect(() => {
        setValue(measure.currentWeekValue?.toString() || "")
    }, [measure.currentWeekValue])

    const handleBlur = useCallback(() => {
        // Validate and parse input
        const numValue = parseFloat(value)

        // Only trigger update if it's a valid number and different from current
        if (!isNaN(numValue) && onUpdate) {
            // Optional: avoid update if value hasn't effectively changed (precision notwithstanding)
            if (numValue !== measure.currentWeekValue) {
                onUpdate(measure.id, numValue)
            }
        }
    }, [value, onUpdate, measure.id, measure.currentWeekValue])

    const progress = Math.min(100, Math.max(0,
        ((parseFloat(value) || 0) / measure.targetPerWeek) * 100
    ))

    return (
        <Card className={cn("w-full transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium truncate max-w-[200px]" title={measure.name}>
                        {measure.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Cible : {measure.targetPerWeek} {measure.unit}/sem
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleBlur}
                        className="w-20 h-8 text-right font-mono"
                        aria-label={`Valeur pour ${measure.name}`}
                    />
                    <span className="text-sm text-muted-foreground w-8 truncate" title={measure.unit}>
                        {measure.unit}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Progress value={progress} className="h-2" aria-label={`${progress.toFixed(0)}% complété`} />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={measure.assignedTo?.avatarUrl || undefined} alt={measure.assignedTo?.fullName || "Avatar"} />
                                <AvatarFallback>
                                    {measure.assignedTo?.fullName?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {measure.assignedTo?.fullName || "Non assigné"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
