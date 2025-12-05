import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LeadMeasure, Profile } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface LeadMeasureWithRelations extends LeadMeasure {
    assignedTo: Pick<Profile, 'fullName' | 'avatarUrl'> | null
    currentWeekValue?: number | null
}

interface LeadMeasureCardProps {
    measure: LeadMeasureWithRelations
    onUpdate?: (id: string, value: number) => void
    className?: string
}

export function LeadMeasureCard({ measure, onUpdate, className }: LeadMeasureCardProps) {
    const [value, setValue] = useState(measure.currentWeekValue?.toString() || "")

    useEffect(() => {
        setValue(measure.currentWeekValue?.toString() || "")
    }, [measure.currentWeekValue])

    const handleBlur = () => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && onUpdate) {
            onUpdate(measure.id, numValue)
        }
    }

    const progress = Math.min(100, Math.max(0,
        ((parseFloat(value) || 0) / measure.targetPerWeek) * 100
    ))

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
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
                        className="w-20 h-8 text-right"
                    />
                    <span className="text-sm text-muted-foreground">{measure.unit}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Progress value={progress} className="h-2" />

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={measure.assignedTo?.avatarUrl || undefined} />
                                <AvatarFallback>
                                    {measure.assignedTo?.fullName?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                {measure.assignedTo?.fullName || "Non assigné"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
