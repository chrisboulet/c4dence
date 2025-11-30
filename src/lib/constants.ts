/**
 * Routes de l'application
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  WIG: (id: string) => `/wig/${id}`,
  CADENCE: '/cadence',
  SETTINGS: '/settings',
} as const

/**
 * Messages UI en français
 */
export const MESSAGES = {
  // Auth
  AUTH_ERROR: 'Erreur d\'authentification. Veuillez réessayer.',
  LOGOUT_SUCCESS: 'Déconnexion réussie.',

  // WIG
  WIG_CREATED: 'Objectif créé avec succès.',
  WIG_UPDATED: 'Objectif mis à jour.',
  WIG_ARCHIVED: 'Objectif archivé.',

  // Lead Measures
  MEASURE_RECORDED: 'Mesure enregistrée.',
  MEASURE_UPDATED: 'Mesure mise à jour.',

  // Engagements
  ENGAGEMENT_CREATED: 'Engagement pris.',
  ENGAGEMENT_COMPLETED: 'Engagement complété.',
  ENGAGEMENT_MISSED: 'Engagement manqué.',

  // Errors
  ERROR_GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  ERROR_NOT_FOUND: 'Élément non trouvé.',
  ERROR_UNAUTHORIZED: 'Accès non autorisé.',
  ERROR_VALIDATION: 'Données invalides.',
} as const

/**
 * Constantes 4DX
 */
export const MAX_WIGS_PER_TEAM = 3
export const MAX_LEAD_MEASURES_PER_WIG = 3
export const MAX_ENGAGEMENTS_PER_PERSON_PER_WEEK = 2

/**
 * Seuils de statut WIG (en pourcentage)
 */
export const WIG_STATUS_THRESHOLDS = {
  ON_TRACK: 0.9,   // >= 90% = vert
  AT_RISK: 0.7,    // >= 70% = jaune
  // < 70% = rouge
} as const
