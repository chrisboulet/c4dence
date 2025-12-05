import { cn } from "@/lib/utils"
import { TaskCategory } from "@prisma/client"

interface TriageMatrixProps {
    activeCategory?: TaskCategory
    className?: string
}

export function TriageMatrix({ activeCategory, className }: TriageMatrixProps) {
    return (
        <div className={cn("grid grid-cols-2 gap-2 w-full max-w-md aspect-square", className)}>
            {/* High Urgency / High Impact */}
            <div
                data-testid="matrix-immediate"
                className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                    activeCategory === 'IMMEDIATE'
                        ? "border-red-500 bg-red-500/10 scale-105 shadow-lg z-10"
                        : "border-muted bg-secondary/20 opacity-50"
                )}
                data-active={activeCategory === 'IMMEDIATE'}
            >
                <div>
                    <div className="font-bold text-red-500">IMMÉDIAT</div>
                    <div className="text-xs text-muted-foreground">Faire maintenant</div>
                </div>
            </div>

            {/* Low Urgency / High Impact */}
            <div
                data-testid="matrix-plan"
                className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                    activeCategory === 'PLAN'
                        ? "border-blue-500 bg-blue-500/10 scale-105 shadow-lg z-10"
                        : "border-muted bg-secondary/20 opacity-50"
                )}
                data-active={activeCategory === 'PLAN'}
            >
                <div>
                    <div className="font-bold text-blue-500">PLANIFIER</div>
                    <div className="text-xs text-muted-foreground">Planifier pour plus tard</div>
                </div>
            </div>

            {/* High Urgency / Low Impact */}
            <div
                data-testid="matrix-delegate"
                className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                    activeCategory === 'DELEGATE'
                        ? "border-yellow-500 bg-yellow-500/10 scale-105 shadow-lg z-10"
                        : "border-muted bg-secondary/20 opacity-50"
                )}
                data-active={activeCategory === 'DELEGATE'}
            >
                <div>
                    <div className="font-bold text-yellow-500">DÉLÉGUER</div>
                    <div className="text-xs text-muted-foreground">Déléguer ou traiter vite</div>
                </div>
            </div>

            {/* Low Urgency / Low Impact */}
            <div
                data-testid="matrix-backlog"
                className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                    activeCategory === 'BACKLOG'
                        ? "border-green-500 bg-green-500/10 scale-105 shadow-lg z-10"
                        : "border-muted bg-secondary/20 opacity-50"
                )}
                data-active={activeCategory === 'BACKLOG'}
            >
                <div>
                    <div className="font-bold text-green-500">BACKLOG</div>
                    <div className="text-xs text-muted-foreground">À faire si temps libre</div>
                </div>
            </div>
        </div>
    )
}
