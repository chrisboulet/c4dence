import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine des classes Tailwind de manière intelligente
 * Évite les conflits (ex: "p-2 p-4" → "p-4")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
