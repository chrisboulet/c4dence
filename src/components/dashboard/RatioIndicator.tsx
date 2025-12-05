import { cn } from "@/lib/utils"

interface RatioIndicatorProps {
    pillarsPercent: number
    className?: string
}

export function RatioIndicator({ pillarsPercent, className }: RatioIndicatorProps) {
    const isHealthy = pillarsPercent >= 10

    return (
        <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
            <span className={cn(
                isHealthy ? "text-green-600" : "text-red-600"
            )}>
                🎵 {100 - pillarsPercent}% | 🎯 {pillarsPercent}%
            </span>
        </div>
    )
}
