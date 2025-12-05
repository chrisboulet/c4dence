import { Objective, ObjectiveStatus, Profile, LeadMeasure } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ObjectiveCard } from "./ObjectiveCard"
import { cn } from "@/lib/utils"

interface ObjectiveWithRelations extends Objective {
    owner: Pick<Profile, 'fullName' | 'avatarUrl'> | null
    leadMeasures?: (LeadMeasure & { assignedTo: Pick<Profile, 'fullName' | 'avatarUrl'> | null })[]
}

interface PillarsScoreboardProps {
    objectives: ObjectiveWithRelations[]
    className?: string
}

export function PillarsScoreboard({ objectives, className }: PillarsScoreboardProps) {
    // Global status logic: DANGER if any objective is AT_RISK or OFF_TRACK
    const isDanger = objectives.some(o => o.status === 'AT_RISK' || o.status === 'OFF_TRACK')
    const globalStatus = isDanger ? 'DANGER' : 'VICTOIRE EN VUE'

    return (
        <div className={cn("space-y-6", className)}>
            <Card className={cn("border-l-4", isDanger ? "border-l-red-500" : "border-l-green-500")}>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                        <span>{isDanger ? '⚠️' : '🏆'}</span>
                        <span>{globalStatus}</span>
                    </CardTitle>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {objectives.map(objective => (
                    <ObjectiveCard key={objective.id} objective={objective} />
                ))}
            </div>
        </div>
    )
}
