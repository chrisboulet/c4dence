/**
 * Routes de l'application
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  OBJECTIVE: (id: string) => `/objective/${id}`,
  SYNC: '/sync',
  SETTINGS: '/settings',
} as const

/**
 * Messages UI en français
 */
export const MESSAGES = {
  // Auth
  AUTH_ERROR: 'Erreur d\'authentification. Veuillez réessayer.',
  LOGOUT_SUCCESS: 'Déconnexion réussie.',

  // Objectifs
  OBJECTIVE_CREATED: 'Objectif créé avec succès.',
  OBJECTIVE_UPDATED: 'Objectif mis à jour.',
  OBJECTIVE_ARCHIVED: 'Objectif archivé.',

  // Indicateurs Prédictifs
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
 * Constantes Méthode C4DENCE
 */
export const MAX_OBJECTIVES_PER_TEAM = 3
export const MAX_LEAD_MEASURES_PER_OBJECTIVE = 3
export const MAX_ENGAGEMENTS_PER_PERSON_PER_WEEK = 2

/**
 * Seuils de statut Objectif (en pourcentage)
 */
export const OBJECTIVE_STATUS_THRESHOLDS = {
  ON_TRACK: 0.9,   // >= 90% = vert
  AT_RISK: 0.7,    // >= 70% = jaune
  // < 70% = rouge
} as const

// Aliases de compatibilité (déprécié)
/** @deprecated Utiliser ROUTES.OBJECTIVE */
export const WIG_ROUTE = ROUTES.OBJECTIVE
/** @deprecated Utiliser MAX_OBJECTIVES_PER_TEAM */
export const MAX_WIGS_PER_TEAM = MAX_OBJECTIVES_PER_TEAM
/** @deprecated Utiliser MAX_LEAD_MEASURES_PER_OBJECTIVE */
export const MAX_LEAD_MEASURES_PER_WIG = MAX_LEAD_MEASURES_PER_OBJECTIVE
/** @deprecated Utiliser OBJECTIVE_STATUS_THRESHOLDS */
export const WIG_STATUS_THRESHOLDS = OBJECTIVE_STATUS_THRESHOLDS
