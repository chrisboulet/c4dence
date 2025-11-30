# 🧩 C4DENCE — Catalogue des Composants UI

**Version** : 1.0  
**Date** : 30 novembre 2025  
**Usage** : Référence pour Claude Code — éviter les duplications, garantir la cohérence

---

## 1. Architecture des Composants

```
src/
├── components/
│   ├── ui/                    # shadcn/ui (NE PAS MODIFIER)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/                # Structure de page
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-link.tsx
│   │   └── page-header.tsx
│   │
│   ├── charts/                # Visualisations (Tremor)
│   │   ├── beat-the-goat.tsx
│   │   ├── lead-measure-chart.tsx
│   │   ├── week-tracker.tsx
│   │   └── trend-badge.tsx
│   │
│   ├── cards/                 # Cartes métier
│   │   ├── wig-card.tsx
│   │   ├── lead-measure-card.tsx
│   │   ├── engagement-card.tsx
│   │   ├── kpi-card.tsx
│   │   └── member-card.tsx
│   │
│   ├── forms/                 # Formulaires
│   │   ├── wig-form.tsx
│   │   ├── lead-measure-form.tsx
│   │   ├── weekly-input.tsx
│   │   ├── engagement-form.tsx
│   │   └── organization-form.tsx
│   │
│   ├── tables/                # Tableaux
│   │   ├── lead-measures-table.tsx
│   │   ├── engagements-table.tsx
│   │   └── members-table.tsx
│   │
│   └── shared/                # Composants partagés
│       ├── status-badge.tsx
│       ├── empty-state.tsx
│       ├── confirm-dialog.tsx
│       ├── date-range-picker.tsx
│       └── week-selector.tsx
```

---

## 2. Composants Layout

### 2.1 AppShell

**Fichier** : `components/layout/app-shell.tsx`  
**Rôle** : Structure principale de l'application (sidebar + contenu)

```typescript
// Usage
<AppShell>
  <AppShell.Sidebar>
    <Sidebar />
  </AppShell.Sidebar>
  <AppShell.Content>
    {children}
  </AppShell.Content>
</AppShell>

// Props
interface AppShellProps {
  children: React.ReactNode
}
```

**Comportement** :
- Sidebar collapsible sur mobile (hamburger menu)
- Sidebar fixe sur desktop (240px)
- Responsive breakpoint : `md` (768px)

---

### 2.2 Sidebar

**Fichier** : `components/layout/sidebar.tsx`  
**Rôle** : Navigation principale + sélecteur d'organisation

```typescript
// Props
interface SidebarProps {
  organizations: OrganizationWithRole[]
  currentOrgId: string
  user: Pick<Profile, 'fullName' | 'email' | 'avatarUrl'>
}

// Sections
1. Logo C4DENCE
2. Sélecteur d'organisation (dropdown)
3. Navigation principale :
   - Tableau de bord (/)
   - Objectifs (/wig)
   - Cadence (/cadence)
   - Équipe (/team)
   - Paramètres (/settings)
4. Profil utilisateur (bas)
```

**États** :
- Expanded (desktop default)
- Collapsed (mobile default, toggle)

---

### 2.3 PageHeader

**Fichier** : `components/layout/page-header.tsx`  
**Rôle** : En-tête de page avec titre, description et actions

```typescript
// Props
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode  // Boutons d'action
  breadcrumbs?: Array<{ label: string; href?: string }>
}

// Usage
<PageHeader
  title="Objectifs ambitieux"
  description="Gérez vos WIGs et suivez leur progression"
  actions={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Nouveau WIG
    </Button>
  }
/>
```

---

### 2.4 NavLink

**Fichier** : `components/layout/nav-link.tsx`  
**Rôle** : Lien de navigation avec état actif

```typescript
// Props
interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
  badge?: number  // Notification count
}

// Usage
<NavLink 
  href="/wig" 
  icon={Target} 
  label="Objectifs"
  badge={3}  // 3 WIGs à risque
/>
```

**États visuels** :
- Default : `text-muted-foreground`
- Hover : `bg-accent`
- Active : `bg-primary/10 text-primary font-medium`

---

## 3. Composants Charts (Tremor)

### 3.1 BeatTheGoat

**Fichier** : `components/charts/beat-the-goat.tsx`  
**Rôle** : Graphique progression réelle vs cible (WIG principal)

```typescript
// Props
interface BeatTheGoatProps {
  wig: WigWithMeasures
  className?: string
}

// Données générées
- Axe X : Semaines (S1 à S52)
- Ligne bleue : Progression réelle
- Ligne grise pointillée : Progression cible (linéaire)
- Zone verte/rouge : Écart positif/négatif
```

**Composants Tremor utilisés** :
- `AreaChart`
- `Card`
- `Title`
- `Text`

**Calcul** :
```typescript
// Progression cible à la semaine N
const targetAtWeek = startValue + (targetValue - startValue) * (weekN / totalWeeks)

// Progression réelle
const actualAtWeek = currentValue // ou calculé depuis lead measures
```

---

### 3.2 LeadMeasureChart

**Fichier** : `components/charts/lead-measure-chart.tsx`  
**Rôle** : Barres hebdomadaires pour une mesure prédictive

```typescript
// Props
interface LeadMeasureChartProps {
  leadMeasure: LeadMeasureWithWeekly
  weeksToShow?: number  // Default: 12
  className?: string
}

// Affichage
- Barres verticales par semaine
- Ligne horizontale : cible hebdo
- Couleur : vert si >= cible, rouge si < cible
```

**Composants Tremor utilisés** :
- `BarChart`
- `Card`

---

### 3.3 WeekTracker

**Fichier** : `components/charts/week-tracker.tsx`  
**Rôle** : Grille style "GitHub contributions" pour visualiser l'historique

```typescript
// Props
interface WeekTrackerProps {
  data: WeeklyStatusPoint[]  // 52 semaines
  className?: string
}

// Affichage
- Grille 52 carrés (1 par semaine)
- Couleurs : vert (>=90%), jaune (70-90%), rouge (<70%), gris (pas de données)
```

**Composants Tremor utilisés** :
- `Tracker`

---

### 3.4 TrendBadge

**Fichier** : `components/charts/trend-badge.tsx`  
**Rôle** : Badge avec flèche de tendance (hausse/baisse)

```typescript
// Props
interface TrendBadgeProps {
  value: number        // Valeur actuelle
  previousValue: number // Valeur précédente
  format?: 'percent' | 'number' | 'currency'
  className?: string
}

// Affichage
- Flèche ↑ verte si hausse
- Flèche ↓ rouge si baisse
- → gris si stable (±2%)
- Valeur du delta formatée
```

**Composants Tremor utilisés** :
- `BadgeDelta`

---

## 4. Composants Cards

### 4.1 WigCard

**Fichier** : `components/cards/wig-card.tsx`  
**Rôle** : Carte résumé d'un WIG pour le dashboard

```typescript
// Props
interface WigCardProps {
  wig: WigSummary
  onClick?: () => void
  className?: string
}

// Contenu
1. StatusBadge (coin supérieur droit)
2. Nom du WIG
3. Progression : "2.75M$ / 3.2M$" avec unité
4. ProgressBar visuelle
5. Date d'échéance : "Échéance : 31 déc. 2025"
6. Nombre de lead measures actives
```

**États** :
- `ON_TRACK` : bordure verte
- `AT_RISK` : bordure jaune
- `OFF_TRACK` : bordure rouge

---

### 4.2 LeadMeasureCard

**Fichier** : `components/cards/lead-measure-card.tsx`  
**Rôle** : Carte pour une mesure prédictive avec entrée rapide

```typescript
// Props
interface LeadMeasureCardProps {
  leadMeasure: LeadMeasureWithWeekly
  currentWeek: { year: number; weekNumber: number }
  onUpdate: (value: number) => void
  className?: string
}

// Contenu
1. Nom de la mesure
2. Cible : "50 appels/semaine"
3. Cette semaine : Input numérique éditable
4. Mini-chart des 4 dernières semaines
5. Tendance (TrendBadge)
```

---

### 4.3 EngagementCard

**Fichier** : `components/cards/engagement-card.tsx`  
**Rôle** : Carte d'un engagement avec statut

```typescript
// Props
interface EngagementCardProps {
  engagement: EngagementWithProfile
  onStatusChange?: (status: EngagementStatus) => void
  isEditable?: boolean
  className?: string
}

// Contenu
1. Avatar + nom de la personne
2. Description de l'engagement
3. StatusBadge (PENDING/COMPLETED/MISSED)
4. Boutons d'action si éditable :
   - ✓ Complété
   - ✗ Manqué
   - Notes de suivi
```

---

### 4.4 KpiCard

**Fichier** : `components/cards/kpi-card.tsx`  
**Rôle** : Carte KPI générique (métrique + tendance)

```typescript
// Props
interface KpiCardProps {
  title: string
  value: string | number
  previousValue?: number
  icon?: LucideIcon
  format?: 'number' | 'percent' | 'currency'
  className?: string
}

// Usage
<KpiCard
  title="Taux de complétion"
  value={85}
  previousValue={78}
  icon={CheckCircle}
  format="percent"
/>
```

**Composants Tremor utilisés** :
- `Card`
- `Metric`
- `Text`
- `BadgeDelta`

---

### 4.5 MemberCard

**Fichier** : `components/cards/member-card.tsx`  
**Rôle** : Carte membre d'équipe

```typescript
// Props
interface MemberCardProps {
  member: MemberWithProfile
  onRoleChange?: (role: MemberRole) => void
  onRemove?: () => void
  canManage?: boolean
  className?: string
}

// Contenu
1. Avatar
2. Nom complet
3. Email
4. Badge rôle (OWNER/ADMIN/MEMBER)
5. Menu actions si canManage
```

---

## 5. Composants Forms

### 5.1 WigForm

**Fichier** : `components/forms/wig-form.tsx`  
**Rôle** : Création/édition d'un WIG

```typescript
// Props
interface WigFormProps {
  wig?: Wig  // Si fourni = mode édition
  onSubmit: (data: CreateWigInput | UpdateWigInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Champs
1. name* : Input text (max 100 chars)
2. description : Textarea (optionnel)
3. startValue* : Input number + unit
4. targetValue* : Input number
5. unit* : Select (prédéfinis + custom)
6. startDate* : DatePicker
7. endDate* : DatePicker

// Validation Zod
- targetValue > startValue
- endDate > startDate
- endDate <= 2 ans dans le futur
```

---

### 5.2 LeadMeasureForm

**Fichier** : `components/forms/lead-measure-form.tsx`  
**Rôle** : Création/édition d'une mesure prédictive

```typescript
// Props
interface LeadMeasureFormProps {
  wigId: string
  leadMeasure?: LeadMeasure  // Si fourni = mode édition
  onSubmit: (data: CreateLeadMeasureInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Champs
1. name* : Input text
2. description : Textarea
3. targetPerWeek* : Input number
4. unit* : Input text (ex: "appels", "démos", "$")
```

---

### 5.3 WeeklyInput

**Fichier** : `components/forms/weekly-input.tsx`  
**Rôle** : Saisie rapide de la valeur hebdomadaire (inline)

```typescript
// Props
interface WeeklyInputProps {
  leadMeasureId: string
  currentValue?: number
  target: number
  unit: string
  week: { year: number; weekNumber: number }
  onSave: (value: number) => Promise<void>
}

// Comportement
- Input numérique compact
- Sauvegarde sur blur ou Enter
- Indicateur visuel vs cible (vert/rouge)
- Loading state pendant sauvegarde
```

---

### 5.4 EngagementForm

**Fichier** : `components/forms/engagement-form.tsx`  
**Rôle** : Création d'un engagement lors de la cadence

```typescript
// Props
interface EngagementFormProps {
  organizationId: string
  week: { year: number; weekNumber: number }
  onSubmit: (data: CreateEngagementInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Champs
1. description* : Textarea (max 500 chars)
   - Placeholder : "Je m'engage à..."
   - Auto-focus

// UX
- Soumission : Ctrl+Enter ou bouton
- Validation : non vide, max 500 chars
```

---

## 6. Composants Tables

### 6.1 LeadMeasuresTable

**Fichier** : `components/tables/lead-measures-table.tsx`  
**Rôle** : Tableau des mesures prédictives d'un WIG

```typescript
// Props
interface LeadMeasuresTableProps {
  leadMeasures: LeadMeasureWithWeekly[]
  currentWeek: { year: number; weekNumber: number }
  onUpdate: (id: string, value: number) => Promise<void>
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  canManage?: boolean
}

// Colonnes
1. Nom de la mesure
2. Cible/semaine
3. S-3, S-2, S-1, Cette semaine (4 dernières)
4. Tendance
5. Actions (si canManage)

// Features
- Édition inline des valeurs
- Tri par nom ou performance
- Highlight semaine courante
```

---

### 6.2 EngagementsTable

**Fichier** : `components/tables/engagements-table.tsx`  
**Rôle** : Tableau des engagements d'une semaine

```typescript
// Props
interface EngagementsTableProps {
  engagements: EngagementWithProfile[]
  onStatusChange: (id: string, status: EngagementStatus) => Promise<void>
  currentUserId: string  // Pour identifier ses propres engagements
}

// Colonnes
1. Membre (avatar + nom)
2. Engagement (description)
3. Statut (badge)
4. Actions (si propriétaire)

// Groupement
- Par statut : PENDING en haut, puis COMPLETED, puis MISSED
```

---

## 7. Composants Shared

### 7.1 StatusBadge

**Fichier** : `components/shared/status-badge.tsx`  
**Rôle** : Badge de statut coloré (WIG ou Engagement)

```typescript
// Props
interface StatusBadgeProps {
  status: WigStatus | EngagementStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean  // Afficher le texte ou juste la couleur
}

// Mapping WigStatus
- ON_TRACK  → 🟢 "En bonne voie"
- AT_RISK   → 🟡 "À risque"
- OFF_TRACK → 🔴 "Hors piste"

// Mapping EngagementStatus
- PENDING   → ⏳ "En attente"
- COMPLETED → ✅ "Complété"
- MISSED    → ❌ "Manqué"
- CANCELLED → 🚫 "Annulé"
```

---

### 7.2 EmptyState

**Fichier** : `components/shared/empty-state.tsx`  
**Rôle** : État vide avec illustration et CTA

```typescript
// Props
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Usage
<EmptyState
  icon={Target}
  title="Aucun objectif ambitieux"
  description="Créez votre premier WIG pour commencer à suivre votre exécution."
  action={{
    label: "Créer un WIG",
    onClick: () => openDialog()
  }}
/>
```

---

### 7.3 ConfirmDialog

**Fichier** : `components/shared/confirm-dialog.tsx`  
**Rôle** : Dialog de confirmation pour actions destructives

```typescript
// Props
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string  // Default: "Confirmer"
  cancelLabel?: string   // Default: "Annuler"
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

// Usage
<ConfirmDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Supprimer ce WIG ?"
  description="Cette action est irréversible. Toutes les mesures associées seront supprimées."
  variant="destructive"
  confirmLabel="Supprimer"
  onConfirm={handleDelete}
/>
```

---

### 7.4 WeekSelector

**Fichier** : `components/shared/week-selector.tsx`  
**Rôle** : Sélecteur de semaine ISO avec navigation

```typescript
// Props
interface WeekSelectorProps {
  value: { year: number; weekNumber: number }
  onChange: (week: { year: number; weekNumber: number }) => void
  minWeek?: { year: number; weekNumber: number }
  maxWeek?: { year: number; weekNumber: number }
}

// Affichage
- "Semaine 48, 2025"
- Boutons < > pour navigation
- Bouton "Aujourd'hui" pour revenir à la semaine courante
```

---

## 8. Icônes (Lucide React)

**Package** : `lucide-react`

### Icônes utilisées par contexte :

| Contexte | Icône | Import |
|----------|-------|--------|
| WIG / Objectif | `Target` | `import { Target } from 'lucide-react'` |
| Lead Measure | `TrendingUp` | `import { TrendingUp } from 'lucide-react'` |
| Engagement | `CheckSquare` | `import { CheckSquare } from 'lucide-react'` |
| Cadence / Réunion | `Calendar` | `import { Calendar } from 'lucide-react'` |
| Dashboard | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` |
| Équipe | `Users` | `import { Users } from 'lucide-react'` |
| Paramètres | `Settings` | `import { Settings } from 'lucide-react'` |
| Ajouter | `Plus` | `import { Plus } from 'lucide-react'` |
| Modifier | `Pencil` | `import { Pencil } from 'lucide-react'` |
| Supprimer | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| Succès | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` |
| Erreur | `XCircle` | `import { XCircle } from 'lucide-react'` |
| Avertissement | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` |
| Info | `Info` | `import { Info } from 'lucide-react'` |
| Navigation | `ChevronLeft`, `ChevronRight` | |
| Menu | `Menu`, `X` | |
| Utilisateur | `User` | |
| Déconnexion | `LogOut` | |

---

## 9. Couleurs Sémantiques

### Palette de statuts (Tailwind)

```css
/* WIG Status */
--status-on-track: hsl(142, 76%, 36%);     /* green-600 */
--status-at-risk: hsl(45, 93%, 47%);       /* yellow-500 */
--status-off-track: hsl(0, 84%, 60%);      /* red-500 */

/* Engagement Status */
--status-pending: hsl(221, 83%, 53%);      /* blue-500 */
--status-completed: hsl(142, 76%, 36%);    /* green-600 */
--status-missed: hsl(0, 84%, 60%);         /* red-500 */
--status-cancelled: hsl(220, 9%, 46%);     /* gray-500 */
```

### Usage dans les composants

```typescript
// Mapping statut → classe Tailwind
const statusColors: Record<WigStatus, string> = {
  ON_TRACK: 'bg-green-100 text-green-800 border-green-200',
  AT_RISK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OFF_TRACK: 'bg-red-100 text-red-800 border-red-200',
}
```

---

## 10. Règles de Composition

### 10.1 Hiérarchie des composants

```
Page (Server Component)
└── PageHeader
└── Section containers
    └── Cards (métier)
        └── UI primitives (shadcn)
            └── Tremor (charts)
```

### 10.2 Props drilling vs Context

```typescript
// ✅ BON — Props pour données spécifiques
<WigCard wig={wig} />

// ✅ BON — Context pour données globales
<OrganizationProvider value={currentOrg}>
  <Sidebar />
  <Content />
</OrganizationProvider>

// ❌ MAUVAIS — Props drilling profond
<Page org={org}>
  <Section org={org}>
    <Card org={org}>
      <Button org={org} />  // NON!
    </Card>
  </Section>
</Page>
```

### 10.3 Composition avec children

```typescript
// ✅ BON — Composants composables
<Card>
  <Card.Header>
    <Card.Title>Mon titre</Card.Title>
  </Card.Header>
  <Card.Content>
    {children}
  </Card.Content>
</Card>

// ❌ MAUVAIS — Props monolithiques
<Card 
  title="Mon titre"
  content={<div>...</div>}
  footer={<Button>...</Button>}
/>
```

---

## 11. Checklist Avant Création

Avant de créer un nouveau composant, vérifier :

```markdown
□ Le composant n'existe pas déjà dans ce catalogue
□ Le composant n'est pas un doublon de shadcn/ui
□ Le nom suit la convention kebab-case
□ Le fichier est dans le bon dossier (layout/charts/cards/forms/tables/shared)
□ Les props sont typées avec interface
□ Le composant est documenté dans ce fichier
□ Les variantes sont gérées par props, pas par composants séparés
```

---

## 12. Composants shadcn/ui à Installer

```bash
# Commande d'installation initiale
npx shadcn@latest init

# Composants requis pour C4DENCE
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add tooltip
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add popover
npx shadcn@latest add calendar
```

---

## 13. Dépendances Tremor

```bash
npm install @tremor/react

# Composants Tremor utilisés
- Card
- Metric
- Text
- Title
- BadgeDelta
- ProgressBar
- AreaChart
- BarChart
- Tracker
```

**Configuration Tailwind pour Tremor** :

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}', // ← Requis
  ],
  theme: {
    extend: {
      // Tremor utilise ces couleurs
    },
  },
  plugins: [],
}
export default config
```

---

**Ce catalogue est la référence pour Claude Code. Tout nouveau composant doit y être ajouté.**
