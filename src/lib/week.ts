import { startOfWeek, getISOWeek, getYear } from 'date-fns'

/**
 * Obtient le numéro de semaine ISO actuel et l'année correspondante.
 * 
 * @returns {Object} Un objet contenant l'année et le numéro de semaine.
 * @example
 * const { year, weekNumber } = getCurrentWeek();
 * // year: 2025, weekNumber: 42
 */
export function getCurrentWeek() {
  const now = new Date()
  return {
    year: getYear(now),
    weekNumber: getISOWeek(now)
  }
}

/**
 * Obtient la date de début (lundi) de la semaine actuelle.
 * 
 * @returns {Date} La date du lundi de la semaine en cours.
 */
export function getCurrentWeekStartDate(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 }) // 1 = Lundi
}

