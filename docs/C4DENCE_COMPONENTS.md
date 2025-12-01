# 🧩 C4DENCE — Catalogue des Composants UI

**Version** : 2.0
**Date** : 1er décembre 2025
**Usage** : Référence pour Claude Code — éviter les duplications, garantir la cohérence

---

## 1. Architecture des Composants (Réelle)

```
src/components/
├── ui/                       # shadcn/ui + composants UI custom
│   ├── alert.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── confetti-celebration.tsx  # Custom - animations de succès
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── skeleton.tsx
│   ├── textarea.tsx
│   ├── tooltip.tsx
│   └── trend-arrow.tsx           # Custom - indicateur tendance
│
├── providers/                # Contexts React
│   ├── index.tsx                 # Export combiné
│   ├── organization-provider.tsx # Multi-org context
│   └── query-provider.tsx        # TanStack Query
│
├── layout/                   # Structure de page
│   ├── header.tsx               # Barre supérieure
│   └── organization-switcher.tsx # Sélecteur d'org
│
├── wig/                      # Objectifs ambitieux (WIGs)
│   ├── wigs-page.tsx            # Liste complète des WIGs
│   ├── wig-dashboard.tsx        # Dashboard avec stats
│   ├── wig-detail.tsx           # Détail d'un WIG
│   ├── wig-list.tsx             # Liste simple
│   ├── wig-form.tsx             # Création/édition
│   └── update-value-dialog.tsx  # Mise à jour valeur actuelle
│
├── lead-measure/             # Mesures prédictives
│   ├── lead-measure-list.tsx    # Liste des mesures
│   ├── lead-measure-form.tsx    # Création/édition
│   └── weekly-input.tsx         # Saisie hebdomadaire
│
├── engagement/               # Engagements d'équipe
│   ├── engagement-widget.tsx    # Widget dashboard
│   ├── engagement-list.tsx      # Liste des engagements
│   └── engagement-form.tsx      # Création d'engagement
│
├── blocker/                  # Obstacles (4DX "Clear")
│   ├── blocker-widget.tsx       # Widget dashboard
│   ├── blocker-list.tsx         # Liste des blockers
│   └── blocker-form.tsx         # Signalement d'obstacle
│
├── cadence/                  # Réunions de cadence
│   ├── cadence-meeting.tsx      # Page réunion complète
│   └── wig-session-timer.tsx    # Timer focus WIG
│
└── charts/                   # Visualisations
    ├── progress-chart.tsx       # Progression WIG
    └── lead-measure-chart.tsx   # Barres mesures prédictives
```

---

## 2. Providers (Contexts)

### 2.1 OrganizationProvider

**Fichier** : `components/providers/organization-provider.tsx`
**Rôle** : Gestion du contexte multi-organisation

```typescript
// Hook exposé
const { currentOrg, organizations, setCurrentOrg, isLoading } = useOrganization()

// Type retourné
interface OrganizationContext {
  currentOrg: OrganizationWithRole | null
  organizations: OrganizationWithRole[]
  setCurrentOrg: (org: OrganizationWithRole) => void
  isLoading: boolean
}
```

**Comportement clé** :
- Persiste l'org sélectionnée dans localStorage
- Tous les composants métier doivent utiliser `currentOrg.organizationId` pour les requêtes
- Re-fetch automatique quand l'org change

---

### 2.2 QueryProvider

**Fichier** : `components/providers/query-provider.tsx`
**Rôle** : Wrapper TanStack Query

```typescript
// Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## 3. Composants Layout

### 3.1 Header

**Fichier** : `components/layout/header.tsx`
**Rôle** : Barre supérieure avec navigation et profil

**Contenu** :
- Logo C4DENCE (lien vers dashboard)
- Navigation principale (liens vers les sections)
- Profil utilisateur avec menu dropdown

---

### 3.2 OrganizationSwitcher

**Fichier** : `components/layout/organization-switcher.tsx`
**Rôle** : Dropdown pour changer d'organisation

```typescript
// Usage
<OrganizationSwitcher />  // Utilise useOrganization() en interne
```

---

## 4. Composants WIG

### 4.1 WigsPage

**Fichier** : `components/wig/wigs-page.tsx`
**Rôle** : Page complète listant tous les WIGs avec statistiques

**Contenu** :
1. Cartes stats : Total, En bonne voie, À risque, Hors piste
2. Liste des WIGs avec progression et statut
3. Bouton "Nouveau WIG" ouvrant WigForm

**Pattern data-fetching** :
```typescript
const { currentOrg } = useOrganization()
useEffect(() => {
  if (currentOrg) fetchWigs(currentOrg.organizationId)
}, [currentOrg])
```

---

### 4.2 WigDashboard

**Fichier** : `components/wig/wig-dashboard.tsx`
**Rôle** : Vue dashboard condensée des WIGs pour la page d'accueil

---

### 4.3 WigDetail

**Fichier** : `components/wig/wig-detail.tsx`
**Rôle** : Détail complet d'un WIG avec ses lead measures

---

### 4.4 WigForm

**Fichier** : `components/wig/wig-form.tsx`
**Rôle** : Dialog pour créer ou modifier un WIG

```typescript
interface WigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wig?: Wig                    // Si fourni = mode édition
  onSuccess?: () => void       // Callback après succès
}
```

**Champs** :
- `name` : Nom du WIG
- `description` : Description optionnelle
- `startValue` : Valeur de départ
- `targetValue` : Valeur cible
- `currentValue` : Valeur actuelle
- `unit` : Unité de mesure
- `startDate` / `endDate` : Période

---

### 4.5 UpdateValueDialog

**Fichier** : `components/wig/update-value-dialog.tsx`
**Rôle** : Dialog simple pour mettre à jour la valeur actuelle d'un WIG

---

## 5. Composants Lead Measure

### 5.1 LeadMeasureList

**Fichier** : `components/lead-measure/lead-measure-list.tsx`
**Rôle** : Liste des mesures prédictives d'un WIG

---

### 5.2 LeadMeasureForm

**Fichier** : `components/lead-measure/lead-measure-form.tsx`
**Rôle** : Dialog pour créer/modifier une mesure prédictive

```typescript
interface LeadMeasureFormProps {
  wigId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  leadMeasure?: LeadMeasure    // Mode édition si fourni
  onSuccess?: () => void
}
```

---

### 5.3 WeeklyInput

**Fichier** : `components/lead-measure/weekly-input.tsx`
**Rôle** : Input inline pour saisir la valeur hebdomadaire

**Comportement** :
- Sauvegarde automatique sur blur
- Indicateur visuel vert/rouge vs cible

---

## 6. Composants Engagement

### 6.1 EngagementWidget

**Fichier** : `components/engagement/engagement-widget.tsx`
**Rôle** : Widget compact pour le dashboard montrant les engagements de la semaine

**Affichage** :
- Titre avec semaine courante
- Compteur complétés/total
- Liste des engagements
- Bouton "Ajouter"

---

### 6.2 EngagementList

**Fichier** : `components/engagement/engagement-list.tsx`
**Rôle** : Liste des engagements avec actions

---

### 6.3 EngagementForm

**Fichier** : `components/engagement/engagement-form.tsx`
**Rôle** : Dialog pour créer un engagement

```typescript
interface EngagementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: number
  weekNumber: number
  onSuccess?: () => void
}
```

---

## 7. Composants Blocker

### 7.1 BlockerWidget

**Fichier** : `components/blocker/blocker-widget.tsx`
**Rôle** : Widget "Obstacles à lever" pour le dashboard

**Affichage** :
- Icône AlertTriangle avec bordure orange
- Description "4DX Phase Clear"
- Compteur actifs
- Liste des blockers
- Bouton "Signaler"

---

### 7.2 BlockerList

**Fichier** : `components/blocker/blocker-list.tsx`
**Rôle** : Liste des obstacles avec statuts

**Statuts** :
- `OPEN` : En attente
- `ESCALATED` : Escaladé
- `RESOLVED` : Résolu

---

### 7.3 BlockerForm

**Fichier** : `components/blocker/blocker-form.tsx`
**Rôle** : Dialog pour signaler un obstacle

---

## 8. Composants Cadence

### 8.1 CadenceMeeting

**Fichier** : `components/cadence/cadence-meeting.tsx`
**Rôle** : Page complète de réunion de cadence 4DX

**Structure 4DX** :
1. **Account** : Revue des engagements passés
2. **Scoreboard** : Visualisation des WIGs
3. **Plan** : Nouveaux engagements
4. **Clear** : Obstacles à lever

---

### 8.2 WigSessionTimer

**Fichier** : `components/cadence/wig-session-timer.tsx`
**Rôle** : Timer pour focus sur un WIG spécifique

---

## 9. Composants Charts

### 9.1 ProgressChart

**Fichier** : `components/charts/progress-chart.tsx`
**Rôle** : Graphique de progression d'un WIG (réel vs cible)

---

### 9.2 LeadMeasureChart

**Fichier** : `components/charts/lead-measure-chart.tsx`
**Rôle** : Barres hebdomadaires pour une mesure prédictive

---

## 10. Composants UI Custom

### 10.1 ConfettiCelebration

**Fichier** : `components/ui/confetti-celebration.tsx`
**Rôle** : Animation de confettis pour célébrer les succès

```typescript
<ConfettiCelebration trigger={isCompleted} />
```

---

### 10.2 TrendArrow

**Fichier** : `components/ui/trend-arrow.tsx`
**Rôle** : Flèche indiquant la tendance (hausse/baisse/stable)

```typescript
<TrendArrow value={currentValue} previousValue={lastWeekValue} />
```

---

## 11. Composants shadcn/ui Installés

Les composants suivants sont installés et disponibles :

| Composant | Fichier | Usage |
|-----------|---------|-------|
| Alert | `ui/alert.tsx` | Messages d'information |
| AlertDialog | `ui/alert-dialog.tsx` | Confirmations destructives |
| Avatar | `ui/avatar.tsx` | Photos de profil |
| Badge | `ui/badge.tsx` | Statuts colorés |
| Button | `ui/button.tsx` | Actions |
| Card | `ui/card.tsx` | Conteneurs |
| Dialog | `ui/dialog.tsx` | Modales |
| DropdownMenu | `ui/dropdown-menu.tsx` | Menus contextuels |
| Input | `ui/input.tsx` | Champs texte |
| Label | `ui/label.tsx` | Labels de formulaire |
| Progress | `ui/progress.tsx` | Barres de progression |
| Select | `ui/select.tsx` | Sélecteurs |
| Skeleton | `ui/skeleton.tsx` | États de chargement |
| Textarea | `ui/textarea.tsx` | Champs multilignes |
| Tooltip | `ui/tooltip.tsx` | Infobulles |

---

## 12. Couleurs de Statut

### Badge Variants (badge.tsx)

```typescript
// Variants personnalisés C4DENCE
const badgeVariants = cva(/* ... */, {
  variants: {
    variant: {
      default: "...",
      secondary: "...",
      destructive: "...",
      outline: "...",
      "on-track": "border-status-on-track/30 bg-status-on-track/10 text-status-on-track",
      "at-risk": "border-status-at-risk/30 bg-status-at-risk/10 text-status-at-risk",
      "off-track": "border-status-off-track/30 bg-status-off-track/10 text-status-off-track",
    },
  },
})
```

### Couleurs CSS (globals.css)

```css
--status-on-track: 174 100% 42%;    /* Cyan C4DENCE */
--status-at-risk: 40 90% 55%;       /* Gold C4DENCE */
--status-off-track: 0 84% 60%;      /* Rouge */

--brand-cyan: 174 100% 42%;
--brand-gold: 40 90% 55%;
--brand-dark: 220 26% 14%;
```

---

## 13. Pattern de Composant Standard

Tous les composants métier suivent ce pattern :

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@/components/providers/organization-provider'
import { someServerAction } from '@/app/actions/...'

export function MyComponent() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const [data, setData] = useState<DataType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async (orgId: string) => {
    setIsLoading(true)
    const result = await someServerAction(orgId)
    if (result.success) {
      setData(result.data)
    }
    setIsLoading(false)
  }, [])

  // CRITIQUE: Re-fetch quand l'org change
  useEffect(() => {
    if (currentOrg && !isOrgLoading) {
      fetchData(currentOrg.organizationId)
    }
  }, [currentOrg, isOrgLoading, fetchData])

  // ... render
}
```

---

## 14. Icônes (Lucide React)

**Package** : `lucide-react`

| Contexte | Icône |
|----------|-------|
| WIG / Objectif | `Target` |
| Lead Measure | `TrendingUp` |
| Engagement | `CheckSquare` |
| Blocker / Obstacle | `AlertTriangle` |
| Dashboard | `LayoutDashboard` |
| Équipe | `Users` |
| Paramètres | `Settings` |
| Ajouter | `Plus` |
| Succès (On Track) | `TrendingUp` |
| Risque (At Risk) | `AlertTriangle` |
| Échec (Off Track) | `XCircle` |
| Navigation | `ArrowRight`, `ChevronLeft`, `ChevronRight` |

---

## 15. Checklist Avant Création

Avant de créer un nouveau composant :

```markdown
□ Vérifier que le composant n'existe pas déjà dans ce catalogue
□ Placer dans le bon dossier (ui/, providers/, layout/, ou dossier métier)
□ Suivre le pattern de data-fetching avec useOrganization()
□ Utiliser les couleurs de statut définies (pas de couleurs hardcodées)
□ Ajouter le composant à ce catalogue après création
```

---

**Ce catalogue reflète l'implémentation réelle au 1er décembre 2025.**
