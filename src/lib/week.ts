/**
 * Obtient le numéro de semaine ISO actuel
 */
export function getCurrentWeek(): { year: number; weekNumber: number } {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return { year: now.getFullYear(), weekNumber }
}
