// =============================================================================
// C4DENCE — Types TypeScript
// =============================================================================
// Types additionnels pour compléter les types générés par Prisma.
// 
// Usage :
// - Les types de base (Wig, LeadMeasure, etc.) viennent de @prisma/client
// - Ce fichier définit les types composés et les DTOs
// =============================================================================

import type {
  Wig,
  LeadMeasure,
  WeeklyMeasure,
  Engagement,
  Profile,
  Organization,
  Membership,
  WigStatus,
  MemberRole,
  EngagementStatus,
} from '@prisma/client'

// =============================================================================
// TYPES COMPOSÉS (avec relations)
// =============================================================================

/**
 * LeadMeasure avec ses mesures hebdomadaires
 * Utilisé dans : Scoreboard, détail WIG
 */
export type LeadMeasureWithWeekly = LeadMeasure & {
  weeklyMeasures: WeeklyMeasure[]
}

/**
 * WIG complet avec toutes ses relations
 * Utilisé dans : Page détail WIG, édition
 */
export type WigWithMeasures = Wig & {
  leadMeasures: LeadMeasureWithWeekly[]
}

/**
 * WIG pour le dashboard (données minimales)
 * Utilisé dans : Dashboard principal, liste des WIGs
 */
export type WigSummary = Pick<
  Wig,
  | 'id'
  | 'name'
  | 'status'
  | 'startValue'
  | 'targetValue'
  | 'currentValue'
  | 'unit'
  | 'startDate'
  | 'endDate'
> & {
  ownerId?: string | null
  owner?: Pick<Profile, 'id' | 'fullName' | 'avatarUrl'> | null
}

/**
 * Organisation avec le membership de l'utilisateur courant
 * Utilisé dans : Sidebar, sélecteur d'organisation
 */
export type OrganizationWithRole = Organization & {
  currentUserRole: MemberRole
}

/**
 * Membership avec l'organisation complète
 * Utilisé dans : OrganizationProvider, switcher
 */
export type MembershipWithOrg = Membership & {
  organization: Organization
}

/**
 * Membre d'une organisation avec son profil
 * Utilisé dans : Page membres, assignation
 */
export type MemberWithProfile = Membership & {
  profile: Pick<Profile, 'id' | 'email' | 'fullName' | 'avatarUrl'>
}

/**
 * Engagement avec le profil de la personne
 * Utilisé dans : Réunion de cadence, historique
 */
export type EngagementWithProfile = Engagement & {
  profile: Pick<Profile, 'id' | 'fullName' | 'avatarUrl'>
}

/**
 * Blocker avec le profil du reporter et le WIG associé
 * Utilisé dans : Page Cadence, section Obstacles
 */
export type BlockerWithProfile = {
  id: string
  createdAt: Date
  updatedAt: Date
  wigId: string
  reportedById: string
  description: string
  status: 'OPEN' | 'ESCALATED' | 'RESOLVED'
  escalatedTo: string | null
  resolvedAt: Date | null
  resolution: string | null
  reportedBy: Pick<Profile, 'id' | 'fullName' | 'avatarUrl'>
  wig: Pick<Wig, 'id' | 'name'>
}

// =============================================================================
// TYPES POUR LES CHARTS
// =============================================================================

/**
 * Point de données pour le chart "Beat the GOAT"
 * Compare la progression réelle vs la progression attendue
 */
export type ProgressDataPoint = {
  /** Label de la semaine : "S48", "S49", etc. */
  week: string
  /** Valeur réelle atteinte */
  actual: number
  /** Valeur cible (progression linéaire attendue) */
  target: number
  /** Date du lundi de la semaine */
  date: Date
}

/**
 * Données pour le chart de mesure prédictive
 * Historique hebdomadaire avec comparaison à la cible
 */
export type LeadMeasureChartData = {
  /** Label de la semaine */
  week: string
  /** Valeur enregistrée */
  value: number
  /** Cible hebdomadaire */
  target: number
  /** Pourcentage d'atteinte */
  percentage: number
}

/**
 * Status tracker pour affichage type "GitHub contributions"
 * Un point par semaine avec couleur selon performance
 */
export type WeeklyStatusPoint = {
  weekNumber: number
  year: number
  /** null = pas de données, sinon pourcentage de la cible */
  value: number | null
  /** Couleur dérivée du pourcentage */
  color: 'green' | 'yellow' | 'red' | 'gray'
}

// =============================================================================
// TYPES POUR LES SERVER ACTIONS
// =============================================================================

/**
 * Résultat standardisé pour toutes les Server Actions
 * Pattern discriminated union pour type-safety
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Input pour créer un WIG
 */
export type CreateWigInput = {
  organizationId: string
  name: string
  description?: string
  startValue: number
  targetValue: number
  unit: string
  startDate: Date
  endDate: Date
  ownerId?: string // 4DX: Responsable du WIG
}

/**
 * Input pour mettre à jour un WIG
 */
export type UpdateWigInput = Partial<CreateWigInput> & {
  id: string
  currentValue?: number
  ownerId?: string // 4DX: Responsable du WIG
}

/**
 * Input pour créer une LeadMeasure
 */
export type CreateLeadMeasureInput = {
  wigId: string
  name: string
  description?: string
  targetPerWeek: number
  unit: string
  assignedToId?: string // 4DX: Responsable de la mesure
}

/**
 * Input pour enregistrer une mesure hebdomadaire
 */
export type RecordWeeklyMeasureInput = {
  leadMeasureId: string
  year: number
  weekNumber: number
  value: number
  notes?: string
}

/**
 * Input pour créer un engagement
 */
export type CreateEngagementInput = {
  organizationId: string
  year: number
  weekNumber: number
  description: string
}

/**
 * Input pour créer un blocker (obstacle)
 */
export type CreateBlockerInput = {
  wigId: string
  description: string
}

/**
 * Input pour mettre à jour un blocker
 */
export type UpdateBlockerInput = {
  id: string
  status?: 'OPEN' | 'ESCALATED' | 'RESOLVED'
  escalatedTo?: string
  resolution?: string
}

/**
 * Input pour mettre à jour le statut d'un engagement
 */
export type UpdateEngagementStatusInput = {
  id: string
  status: EngagementStatus
  followUpNotes?: string
}

/**
 * Input pour créer une organisation
 */
export type CreateOrganizationInput = {
  name: string
  slug?: string
}

/**
 * Input pour inviter un membre
 */
export type InviteMemberInput = {
  organizationId: string
  email: string
  role?: MemberRole
}

// =============================================================================
// TYPES POUR L'UI
// =============================================================================

/**
 * Option pour les selects/dropdowns
 */
export type SelectOption<T = string> = {
  label: string
  value: T
  disabled?: boolean
}

/**
 * Onglet de navigation
 */
export type NavTab = {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}

/**
 * Colonne pour les tableaux
 */
export type TableColumn<T> = {
  id: keyof T | string
  header: string
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

/**
 * Props communes pour les pages avec paramètres
 */
export type PageProps<T extends Record<string, string> = {}> = {
  params: T
  searchParams: Record<string, string | string[] | undefined>
}

/**
 * Props pour les pages avec ID
 */
export type PageWithIdProps = PageProps<{ id: string }>

// =============================================================================
// TYPES POUR LA RÉUNION DE CADENCE
// =============================================================================

/**
 * Données complètes pour une réunion de cadence
 * Regroupe tout ce qui est nécessaire pour la réunion hebdo
 */
export type CadenceMeetingData = {
  /** Semaine courante (ISO) */
  currentWeek: {
    year: number
    weekNumber: number
  }
  /** Organisation */
  organization: Pick<Organization, 'id' | 'name' | 'cadenceDay' | 'cadenceTime'>
  /** WIGs actifs avec leurs mesures */
  wigs: WigWithMeasures[]
  /** Engagements de la semaine passée (à rapporter) */
  previousEngagements: EngagementWithProfile[]
  /** Engagements de la semaine courante */
  currentEngagements: EngagementWithProfile[]
  /** Membres présents */
  members: MemberWithProfile[]
}

/**
 * Résumé d'un engagement pour l'affichage rapide
 */
export type EngagementSummary = {
  total: number
  completed: number
  missed: number
  pending: number
  completionRate: number
}

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

/**
 * Rend certaines propriétés optionnelles
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Rend certaines propriétés requises
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Extrait les clés d'un type qui sont des strings
 */
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

/**
 * Type pour les filtres de recherche
 */
export type SearchFilters = {
  query?: string
  status?: WigStatus | 'all'
  dateRange?: {
    from: Date
    to: Date
  }
}

// =============================================================================
// RE-EXPORTS PRISMA
// =============================================================================
// Pour éviter d'importer depuis deux endroits différents

export type {
  Wig,
  LeadMeasure,
  WeeklyMeasure,
  Engagement,
  Profile,
  Organization,
  Membership,
  Blocker,
  WigStatus,
  MemberRole,
  EngagementStatus,
  BlockerStatus,
} from '@prisma/client'
