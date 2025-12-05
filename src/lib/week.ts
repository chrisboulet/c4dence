import { startOfWeek, getISOWeek, getYear } from 'date-fns'

/**
 * Obtient le numéro de semaine ISO actuel
 */
export function getCurrentWeek() {
  const now = new Date()
  return {
    year: getYear(now),
    weekNumber: getISOWeek(now)
  }
}

/**
 * Obtient la date de début (lundi) de la semaine actuelle
 */
export function getCurrentWeekStartDate(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 }) // 1 = Lundi
}

