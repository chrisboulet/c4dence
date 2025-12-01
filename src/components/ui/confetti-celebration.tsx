'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

type ConfettiCelebrationProps = {
  /** Déclencheur de la célébration */
  trigger: boolean
  /** Durée de l'animation en ms (défaut: 5000) */
  duration?: number
  /** Couleurs des confettis */
  colors?: string[]
}

/**
 * Composant de célébration avec confettis
 * Utilisé pour célébrer l'atteinte d'un objectif (WIG ACHIEVED)
 */
export function ConfettiCelebration({
  trigger,
  duration = 5000,
  colors = ['#8B5CF6', '#22D3EE', '#F59E0B', '#10B981', '#EC4899'],
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Mettre à jour la taille de la fenêtre
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!isActive) return null

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.3}
      colors={colors}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
