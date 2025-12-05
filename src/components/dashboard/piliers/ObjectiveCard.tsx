import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Objective, ObjectiveStatus, Profile } from "@prisma/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ObjectiveWithRelations extends Objective {
    owner: Pick<Profile, 'fullName' | 'avatarUrl'> | null
}

interface ObjectiveCardProps {
    objective: ObjectiveWithRelations
    className?: string
}

export function ObjectiveCard({ objective, className }: ObjectiveCardProps) {
    const progress = Math.min(100, Math.max(0,
        ((objective.currentValue - objective.startValue) / (objective.targetValue - objective.startValue)) * 100
    ))

    const statusColors = {
        ON_TRACK: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        AT_RISK: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        OFF_TRACK: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        ACHIEVED: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    }

    const statusLabels = {
        ON_TRACK: "En bonne voie",
        AT_RISK: "À risque",
        OFF_TRACK: "Hors piste",
        ACHIEVED: "Atteint",
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
                        {objective.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Échéance : {format(new Date(objective.endDate), "d MMMM yyyy", { locale: fr })}
                    </p>
                </div>
                <Badge variant="secondary" className={statusColors[objective.status]}>
                    {objective.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{objective.currentValue.toLocaleString()} {objective.unit}</span>
                        <span>{objective.targetValue.toLocaleString()} {objective.unit}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={objective.owner?.avatarUrl || undefined} />
                            <AvatarFallback>
                                {objective.owner?.fullName?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                            {objective.owner?.fullName || "Non assigné"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
