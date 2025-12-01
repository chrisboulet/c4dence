'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type TrendArrowProps = {
  current: number
  previous: number
  /** Seuil de stabilité en pourcentage (défaut: 5%) */
  threshold?: number
  /** Afficher le pourcentage de variation */
  showPercentage?: boolean
  className?: string
}

/**
 * Composant TrendArrow - Pilier 3
 * Compare la valeur actuelle avec la précédente et affiche une flèche
 * ↑ vert si amélioration
 * ↓ rouge si régression
 * → gris si stable (±5%)
 */
export function TrendArrow({
  current,
  previous,
  threshold = 5,
  showPercentage = false,
  className,
}: TrendArrowProps) {
  // Éviter la division par zéro
  if (previous === 0) {
    if (current > 0) {
      return (
        <span className={cn('inline-flex items-center gap-1 text-status-on-track', className)}>
          <TrendingUp className="h-4 w-4" />
          {showPercentage && <span className="text-xs">+100%</span>}
        </span>
      )
    }
    return (
      <span className={cn('inline-flex items-center gap-1 text-muted-foreground', className)}>
        <Minus className="h-4 w-4" />
      </span>
    )
  }

  const changePercent = ((current - previous) / previous) * 100

  // Stable si dans la fourchette ±threshold%
  if (Math.abs(changePercent) <= threshold) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-muted-foreground', className)}>
        <Minus className="h-4 w-4" />
        {showPercentage && <span className="text-xs">{changePercent > 0 ? '+' : ''}{changePercent.toFixed(0)}%</span>}
      </span>
    )
  }

  // Amélioration
  if (changePercent > threshold) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-status-on-track', className)}>
        <TrendingUp className="h-4 w-4" />
        {showPercentage && <span className="text-xs">+{changePercent.toFixed(0)}%</span>}
      </span>
    )
  }

  // Régression
  return (
    <span className={cn('inline-flex items-center gap-1 text-status-off-track', className)}>
      <TrendingDown className="h-4 w-4" />
      {showPercentage && <span className="text-xs">{changePercent.toFixed(0)}%</span>}
    </span>
  )
}

type WinningIndicatorProps = {
  objectives: Array<{ status: string }>
  className?: string
}

/**
 * Indicateur VICTOIRE/DÉFAITE - Pilier 3
 * Affiche si l'équipe gagne ou perd en 5 secondes
 */
export function WinningIndicator({ objectives, className }: WinningIndicatorProps) {
  if (objectives.length === 0) return null

  const onTrackCount = objectives.filter(
    (w) => w.status === 'ON_TRACK' || w.status === 'ACHIEVED'
  ).length
  const winningRatio = onTrackCount / objectives.length

  const isWinning = winningRatio > 0.5

  if (isWinning) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-on-track/20 text-status-on-track font-bold text-2xl md:text-4xl',
        className
      )}>
        <span>VICTOIRE</span>
        <span>🏆</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-status-off-track/20 text-status-off-track font-bold text-2xl md:text-4xl',
      className
    )}>
      <span>DÉFAITE</span>
      <span>⚠️</span>
    </div>
  )
}
