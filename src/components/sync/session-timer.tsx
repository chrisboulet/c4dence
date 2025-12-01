'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type Phase = {
  id: string
  name: string
  nameFr: string
  duration: number // en secondes
  color: string
}

const PHASES: Phase[] = [
  { id: 'account', name: 'Account', nameFr: 'Rendre des comptes', duration: 5 * 60, color: 'bg-brand-purple' },
  { id: 'review', name: 'Review', nameFr: 'Réviser le tableau', duration: 5 * 60, color: 'bg-brand-cyan' },
  { id: 'plan', name: 'Plan', nameFr: 'Planifier', duration: 10 * 60, color: 'bg-brand-gold' },
  { id: 'clear', name: 'Clear', nameFr: 'Lever les obstacles', duration: 5 * 60, color: 'bg-status-at-risk' },
  { id: 'commit', name: 'Commit', nameFr: 'S\'engager', duration: 5 * 60, color: 'bg-brand-lime' },
]

const TOTAL_DURATION = PHASES.reduce((acc, p) => acc + p.duration, 0)

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function SessionTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(PHASES[0].duration)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentPhase = PHASES[currentPhaseIndex]
  const isComplete = currentPhaseIndex >= PHASES.length

  // Jouer un son de notification
  const playNotification = useCallback(() => {
    if (!soundEnabled) return

    // Utiliser l'API Web Audio pour un son simple
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 880 // La4
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch {
      // Fallback silencieux si Web Audio n'est pas disponible
    }
  }, [soundEnabled])

  // Timer effect
  useEffect(() => {
    if (!isRunning || isComplete) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Passer à la phase suivante
          if (currentPhaseIndex < PHASES.length - 1) {
            setCurrentPhaseIndex(currentPhaseIndex + 1)
            playNotification()
            return PHASES[currentPhaseIndex + 1].duration
          } else {
            // Terminé
            setIsRunning(false)
            playNotification()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, currentPhaseIndex, isComplete, playNotification])

  const handleReset = () => {
    setIsRunning(false)
    setCurrentPhaseIndex(0)
    setTimeRemaining(PHASES[0].duration)
  }

  const handleToggle = () => {
    if (isComplete) {
      handleReset()
    } else {
      setIsRunning(!isRunning)
    }
  }

  // Calculer le temps total écoulé
  const elapsedTime = PHASES.slice(0, currentPhaseIndex).reduce((acc, p) => acc + p.duration, 0)
    + (currentPhase ? currentPhase.duration - timeRemaining : 0)
  const totalProgress = (elapsedTime / TOTAL_DURATION) * 100

  return (
    <Card className="border-brand-purple/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timer de Session</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase actuelle */}
        {!isComplete ? (
          <div className="text-center space-y-2">
            <div className={cn(
              'inline-block px-4 py-1 rounded-full text-sm font-medium',
              currentPhase.color,
              'text-white'
            )}>
              {currentPhase.nameFr}
            </div>
            <div className="text-5xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground">
              Phase {currentPhaseIndex + 1} sur {PHASES.length}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-status-on-track">
              Terminé!
            </div>
            <p className="text-sm text-muted-foreground">
              Durée totale: {formatTime(TOTAL_DURATION)}
            </p>
          </div>
        )}

        {/* Barre de progression globale */}
        <div className="space-y-2">
          <Progress value={totalProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(elapsedTime)}</span>
            <span>{formatTime(TOTAL_DURATION)}</span>
          </div>
        </div>

        {/* Indicateurs de phases */}
        <div className="flex justify-center gap-1">
          {PHASES.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                'flex-1 h-2 rounded-full transition-all',
                index < currentPhaseIndex ? phase.color :
                index === currentPhaseIndex ? `${phase.color} animate-pulse` :
                'bg-muted'
              )}
              title={phase.nameFr}
            />
          ))}
        </div>

        {/* Boutons de contrôle */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={currentPhaseIndex === 0 && timeRemaining === PHASES[0].duration}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            onClick={handleToggle}
            className={cn(
              'px-8',
              isRunning ? 'bg-status-at-risk hover:bg-status-at-risk/90' : ''
            )}
          >
            {isComplete ? (
              'Recommencer'
            ) : isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Démarrer
              </>
            )}
          </Button>
        </div>

        {/* Légende des phases */}
        <div className="grid grid-cols-5 gap-1 text-xs text-center">
          {PHASES.map((phase) => (
            <div key={phase.id} className="space-y-1">
              <div className={cn('h-1 rounded-full', phase.color)} />
              <span className="text-muted-foreground">{phase.duration / 60}m</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
