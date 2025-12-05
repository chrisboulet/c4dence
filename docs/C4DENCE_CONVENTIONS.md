# 📐 C4DENCE — Conventions de Code

**Version** : 1.0  
**Date** : 30 novembre 2025  
**Usage** : À inclure dans le contexte de Claude Code pour garantir la cohérence

---

## 1. Langue et Nommage

### 1.1 Règle générale

| Élément | Langue | Exemple |
|---------|--------|---------|
| Code (variables, fonctions, types) | **Anglais** | `getWeeklyMeasures()`, `ObjectiveStatus` |
| Commentaires | **Français** | `// Calcule le statut selon les seuils C4DENCE` |
| UI (labels, messages) | **Français** | `"Objectif stratégique"`, `"Mesure prédictive"` |
| Noms de fichiers | **Anglais** | `objective-card.tsx`, `weekly-measure.ts` |
| Commits | **Français** | `feat: ajout du scoreboard Objectif` |

### 1.2 Conventions de casing

```typescript
// PascalCase — Types, Interfaces, Components, Enums
type ObjectiveStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'ACHIEVED'
interface LeadMeasure { ... }
function ObjectiveCard() { ... }
enum EngagementStatus { ... }

// camelCase — Variables, fonctions, props
const currentWeek = getISOWeek(new Date())
function calculateObjectiveStatus(objective: Objective): ObjectiveStatus { ... }
<ObjectiveCard objectiveId={selectedObjective} onSelect={handleSelect} />

// SCREAMING_SNAKE_CASE — Constantes, Enum values
const MAX_LEAD_MEASURES_PER_OBJECTIVE = 3
const DEFAULT_SYNC_DAY = 'MONDAY'

// kebab-case — Fichiers, dossiers, CSS classes
src/components/objective/objective-card.tsx
src/app/dashboard/piliers/objectifs/[id]/page.tsx
className="objective-card-header"

// snake_case — Colonnes base de données (Prisma)
model Objective {
  id              String   @id
  created_at      DateTime @default(now())
  organization_id String
}
```

### 1.3 Préfixes et suffixes

```typescript
// Hooks personnalisés — préfixe "use"
function useObjectiveStatus(objectiveId: string) { ... }
function useWeeklyMeasures(leadMeasureId: string) { ... }

// Server Actions — suffixe "Action"
async function updateMeasureAction(formData: FormData) { ... }
async function createEngagementAction(data: EngagementInput) { ... }

// Types de props — suffixe "Props"
interface ObjectiveCardProps { ... }
interface ScoreboardProps { ... }

// Types de réponse — suffixe "Result" ou "Response"
type UpdateMeasureResult = { success: boolean; error?: string }

// Schemas Zod — suffixe "Schema"
const CreateObjectiveSchema = z.object({ ... })
const WeeklyMeasureSchema = z.object({ ... })
```

---

## 2. Structure des Fichiers

### 2.1 Arborescence obligatoire

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Route group — pages auth
│   │   ├── login/
│   │   └── onboarding/
│   ├── dashboard/            # Routes protégées (layout partagé)
│   │   ├── layout.tsx        # Layout avec header
│   │   ├── orchestration/    # Dashboard central
│   │   │   ├── page.tsx      # Vue d'ensemble
│   │   │   └── sync/         # Réunion de synchronisation
│   │   │       └── page.tsx
│   │   ├── plancher/         # Niveau opérationnel
│   │   │   ├── page.tsx      # Redirect vers /flux
│   │   │   ├── flux/         # Kanban
│   │   │   ├── triage/       # Matrice
│   │   │   └── metriques/    # Stats
│   │   ├── piliers/          # Niveau stratégique
│   │   │   ├── page.tsx      # Redirect vers /objectifs
│   │   │   ├── objectifs/    # Objectifs Prioritaires
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── indicateurs/  # Indicateurs Prédictifs
│   │   │   └── scoreboard/   # Tableau de Score
│   │   ├── members/          # Gestion des membres
│   │   └── settings/
│   ├── actions/              # Server Actions centralisées
│   │   ├── objective.ts
│   │   ├── lead-measure.ts
│   │   ├── engagement.ts
│   │   └── organization.ts
│   ├── api/                  # API Routes (minimal)
│   │   └── webhooks/         # Uniquement webhooks externes
│   ├── layout.tsx            # Root layout
│   └── globals.css
│
├── components/               # Composants réutilisables
│   ├── ui/                   # shadcn/ui (ne pas modifier)
│   ├── charts/               # Composants graphiques
│   │   ├── progress-chart.tsx
│   │   └── lead-measure-chart.tsx
│   ├── objective/            # Composants Objectif
│   │   ├── objective-form.tsx
│   │   ├── objective-list.tsx
│   │   └── objective-dashboard.tsx
│   ├── sync/                 # Composants Synchronisation
│   │   ├── sync-meeting.tsx
│   │   └── session-timer.tsx
│   └── layout/               # Composants layout
│       ├── header.tsx
│       └── organization-switcher.tsx
│
├── lib/                      # Utilitaires et configs
│   ├── supabase/
│   │   ├── server.ts         # createServerClient
│   │   ├── client.ts         # createBrowserClient
│   │   └── middleware.ts     # Auth helpers
│   ├── prisma.ts             # Instance Prisma singleton
│   ├── utils.ts              # Helpers génériques (cn, formatDate, etc.)
│   ├── constants.ts          # Constantes globales
│   └── validations/          # Schemas Zod
│       ├── objective.ts
│       └── measure.ts
│
├── hooks/                    # Custom hooks
│   ├── use-objective-status.ts
│   └── use-weekly-measures.ts
│
├── types/                    # Types TypeScript globaux
│   ├── database.ts           # Types générés par Prisma
│   ├── api.ts                # Types API/Actions
│   └── ui.ts                 # Types UI partagés
│
└── styles/                   # Styles additionnels (si nécessaire)
    └── tremor-overrides.css
```

### 2.2 Colocalisation des composants

```typescript
// ✅ BON — Composants spécifiques colocalisés avec underscore
src/app/dashboard/piliers/objectifs/[id]/
├── page.tsx                    // Server Component principal
├── actions.ts                  // Server Actions (optionnel, voir /app/actions)
├── loading.tsx                 // Loading state
├── error.tsx                   // Error boundary
└── _components/                // Underscore = ignoré par le router
    ├── lead-measure-table.tsx  // Client Component
    └── weekly-input.tsx        // Client Component

// ❌ MAUVAIS — Tout dans /components global
src/components/
├── objective-page-lead-measure-table.tsx  // Trop spécifique pour être global
└── objective-page-weekly-input.tsx
```

### 2.3 Règle des imports

```typescript
// Ordre des imports (enforced par ESLint)
// 1. React et Next.js
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

// 2. Librairies externes
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Composants UI (shadcn, Tremor)
import { Card, CardContent } from '@/components/ui/card'
import { AreaChart } from '@tremor/react'

// 4. Composants internes
import { ObjectiveCard } from '@/components/objective/objective-card'
import { LeadMeasureTable } from './_components/lead-measure-table'

// 5. Lib et utils
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { calculateObjectiveStatus } from '@/lib/objective-status'

// 6. Types
import type { Objective, LeadMeasure } from '@prisma/client'
import type { ObjectiveWithMeasures } from '@/types'
```

---

## 3. Patterns React Server Components

### 3.1 Règle d'or : Server First

```typescript
// ✅ PAR DÉFAUT — Server Component (pas de directive)
// src/app/dashboard/piliers/objectifs/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { ObjectiveDetail } from '@/components/objective/objective-detail'

export default async function ObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // Next.js 16 async params

  // Fetch direct avec Prisma — pas de useEffect, pas de useState
  const objective = await prisma.objective.findUnique({
    where: { id },
    include: {
      leadMeasures: {
        include: { weeklyMeasures: true }
      }
    }
  })

  if (!objective) redirect('/dashboard/piliers/objectifs')

  return <ObjectiveDetail objective={objective} />
}

// ✅ CLIENT COMPONENT — Uniquement si interactivité requise
// src/components/lead-measure/lead-measure-list.tsx
'use client'

import { useState } from 'react'
import { updateMeasureAction } from '@/app/actions/lead-measure'

interface LeadMeasureListProps {
  leadMeasures: LeadMeasureWithWeekly[]
  objectiveId: string
}

export function LeadMeasureList({ leadMeasures, objectiveId }: LeadMeasureListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  // ... interactivité
}
```

### 3.2 Quand utiliser 'use client'

```typescript
// ✅ UTILISER 'use client' pour :
// - useState, useEffect, useRef
// - Event handlers (onClick, onChange, onSubmit)
// - Browser APIs (localStorage, window)
// - Hooks custom qui utilisent des hooks React
// - Composants avec animations/transitions

// ❌ NE PAS utiliser 'use client' pour :
// - Affichage de données statiques
// - Fetch de données (utiliser Server Component)
// - Layouts sans interactivité
// - Composants qui ne font que passer des props
```

### 3.3 Server Actions

```typescript
// src/app/(dashboard)/objectives/[id]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// Schema de validation
const UpdateMeasureSchema = z.object({
  leadMeasureId: z.string().uuid(),
  weekNumber: z.number().min(1).max(53),
  year: z.number().min(2024),
  value: z.number().min(0),
})

// Type de retour standardisé
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateMeasureAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Authentification
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Non authentifié' }
    }
    
    // 2. Validation
    const rawData = {
      leadMeasureId: formData.get('leadMeasureId'),
      weekNumber: Number(formData.get('weekNumber')),
      year: Number(formData.get('year')),
      value: Number(formData.get('value')),
    }
    
    const parsed = UpdateMeasureSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: 'Données invalides' }
    }
    
    // 3. Vérification d'autorisation (via RLS ou query)
    const leadMeasure = await prisma.leadMeasure.findFirst({
      where: {
        id: parsed.data.leadMeasureId,
        objective: {
          organization: {
            memberships: { some: { profileId: user.id } }
          }
        }
      }
    })
    
    if (!leadMeasure) {
      return { success: false, error: 'Mesure non trouvée' }
    }
    
    // 4. Mutation
    const result = await prisma.weeklyMeasure.upsert({
      where: {
        leadMeasureId_year_weekNumber: {
          leadMeasureId: parsed.data.leadMeasureId,
          year: parsed.data.year,
          weekNumber: parsed.data.weekNumber,
        }
      },
      update: { value: parsed.data.value },
      create: {
        leadMeasureId: parsed.data.leadMeasureId,
        year: parsed.data.year,
        weekNumber: parsed.data.weekNumber,
        value: parsed.data.value,
      }
    })
    
    // 5. Revalidation du cache
    revalidatePath(`/dashboard/piliers/objectifs/${leadMeasure.objectiveId}`)
    
    return { success: true, data: { id: result.id } }
    
  } catch (error) {
    console.error('updateMeasureAction error:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
```

---

## 4. Gestion des Erreurs

### 4.1 Pattern standard

```typescript
// Type de résultat uniforme pour toutes les actions
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// Utilisation côté client
const result = await updateMeasureAction(formData)

if (result.success) {
  toast.success('Mesure enregistrée')
  // result.data est typé
} else {
  toast.error(result.error)
}
```

### 4.2 Error Boundaries

```typescript
// src/app/(dashboard)/objectives/[id]/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ObjectiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log vers service de monitoring (Sentry, etc.)
    console.error('Objective Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="text-muted-foreground">
        Impossible de charger cet objectif stratégique.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  )
}
```

### 4.3 Loading States

```typescript
// src/app/(dashboard)/objectives/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ObjectiveLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      
      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. Composants UI

### 5.1 shadcn/ui — Ne pas modifier

```typescript
// Les composants dans /components/ui/ sont générés par shadcn
// NE JAMAIS les modifier directement
// Si customisation nécessaire, créer un wrapper

// ❌ MAUVAIS — Modifier le fichier shadcn
// src/components/ui/button.tsx
// ... modifications ...

// ✅ BON — Créer un wrapper
// src/components/custom-button.tsx
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean
}

export function CustomButton({ isLoading, children, ...props }: CustomButtonProps) {
  return (
    <Button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? <Spinner /> : children}
    </Button>
  )
}
```

### 5.2 Tremor — Dashboard Components

```typescript
// Utiliser Tremor pour les composants de dashboard
import { 
  Card, 
  Metric, 
  Text, 
  AreaChart, 
  BadgeDelta,
  ProgressBar,
  Tracker 
} from '@tremor/react'

// Pattern pour les KPI cards
function KpiCard({ 
  title, 
  value, 
  delta, 
  deltaType 
}: { 
  title: string
  value: string | number
  delta: string
  deltaType: 'increase' | 'decrease' | 'unchanged'
}) {
  return (
    <Card>
      <Text>{title}</Text>
      <Metric>{value}</Metric>
      <BadgeDelta deltaType={deltaType}>{delta}</BadgeDelta>
    </Card>
  )
}
```

### 5.3 Accessibilité obligatoire

```typescript
// Toujours inclure les attributs d'accessibilité
<Button 
  aria-label="Enregistrer la mesure"
  aria-describedby="measure-help"
>
  Enregistrer
</Button>

// Labels pour les inputs
<Label htmlFor="measure-value">Valeur de la semaine</Label>
<Input 
  id="measure-value"
  aria-describedby="measure-hint"
/>
<p id="measure-hint" className="text-sm text-muted-foreground">
  Entrez le nombre d'appels effectués cette semaine
</p>

// Keyboard navigation
<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent 
    onOpenAutoFocus={(e) => e.preventDefault()} // Si focus custom nécessaire
  >
    {/* Le focus trap est géré automatiquement par Radix */}
  </DialogContent>
</Dialog>
```

---

## 6. Base de Données

### 6.1 Conventions Prisma

```prisma
// prisma/schema.prisma

// Noms de modèles en PascalCase singulier
model Organization {
  // ID toujours en premier
  id        String   @id @default(uuid())
  
  // Timestamps standards
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Champs métier
  name      String
  slug      String   @unique
  
  // Relations en dernier
  memberships Membership[]
  objectives  Objective[]

  // Mapping vers snake_case pour PostgreSQL
  @@map("organizations")
}

// Enum en SCREAMING_SNAKE_CASE
enum ObjectiveStatus {
  ON_TRACK
  AT_RISK
  OFF_TRACK
  ACHIEVED
}

// Index explicites pour les queries fréquentes
model WeeklyMeasure {
  id            String @id @default(uuid())
  leadMeasureId String @map("lead_measure_id")
  year          Int
  weekNumber    Int    @map("week_number")
  value         Float
  
  leadMeasure   LeadMeasure @relation(fields: [leadMeasureId], references: [id], onDelete: Cascade)
  
  // Index composé pour lookup rapide
  @@unique([leadMeasureId, year, weekNumber])
  @@index([leadMeasureId])
  @@map("weekly_measures")
}
```

### 6.2 Queries optimisées

```typescript
// ✅ BON — Select explicite, include minimal
const objective = await prisma.objective.findUnique({
  where: { id: objectiveId },
  select: {
    id: true,
    name: true,
    targetValue: true,
    currentValue: true,
    leadMeasures: {
      select: {
        id: true,
        name: true,
        weeklyMeasures: {
          where: { year: currentYear },
          orderBy: { weekNumber: 'desc' },
          take: 12, // Dernières 12 semaines seulement
        }
      }
    }
  }
})

// ❌ MAUVAIS — Include all, pas de limite
const objective = await prisma.objective.findUnique({
  where: { id: objectiveId },
  include: {
    leadMeasures: {
      include: {
        weeklyMeasures: true // Toutes les semaines de tous les temps!
      }
    }
  }
})
```

---

## 7. Tests (Structure)

```
__tests__/
├── unit/                    # Tests unitaires (logique pure)
│   ├── lib/
│   │   └── objective-status.test.ts
│   └── validations/
│       └── measure.test.ts
│
├── integration/             # Tests d'intégration (DB, API)
│   ├── actions/
│   │   └── measure-actions.test.ts
│   └── api/
│
└── e2e/                     # Tests end-to-end (Playwright)
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── objective-flow.spec.ts
```

---

## 8. Git et Commits

### 8.1 Format des commits (Conventional Commits)

```bash
# Format : <type>(<scope>): <description>

# Types autorisés
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage (pas de changement de code)
refactor: # Refactoring (pas de nouvelle feature, pas de fix)
test:     # Ajout/modification de tests
chore:    # Maintenance (deps, config, etc.)

# Exemples
feat(objective): ajout de la page scoreboard
fix(measure): correction du calcul hebdomadaire
docs: mise à jour du README avec instructions Supabase
refactor(auth): migration vers @supabase/ssr
test(objective-status): ajout des cas limites
chore(deps): mise à jour de Next.js vers 15.5

# Corps de commit pour contexte additionnel
feat(dashboard): implémentation du "Beat the GOAT" chart

- Utilise Tremor AreaChart pour la visualisation
- Compare progression réelle vs cible
- Calcul automatique du trend
```

### 8.2 Branches

```bash
# Branches principales
main        # Production
develop     # Intégration (optionnel pour MVP)

# Branches de travail
feat/nom-feature     # Nouvelles fonctionnalités
fix/description-bug  # Corrections
refactor/description # Refactoring

# Exemples
feat/objective-scoreboard
fix/weekly-measure-validation
refactor/server-actions-cleanup
```

---

## 9. Checklist Avant Commit

```markdown
□ Le code compile sans erreur (`npm run build`)
□ Pas de `console.log` oublié (sauf dans error handlers)
□ Les types sont explicites (pas de `any`)
□ Les Server Actions ont validation Zod
□ Les Client Components ont 'use client' en première ligne
□ Les imports sont dans l'ordre correct
□ Les messages UI sont en français
□ L'accessibilité est respectée (labels, aria-*)
□ Les erreurs sont gérées (try/catch, error boundaries)
```

---

## 10. Anti-Patterns à Éviter

```typescript
// ❌ JAMAIS — any
const data: any = await fetch(...)

// ✅ TOUJOURS — Types explicites
const data: ObjectiveResponse = await fetch(...)

// ❌ JAMAIS — Fetch dans useEffect pour data initiale
useEffect(() => {
  fetch('/api/objectives').then(...)
}, [])

// ✅ TOUJOURS — Server Component pour data initiale
export default async function Page() {
  const objectives = await prisma.objective.findMany(...)
  return <ObjectiveList objectives={objectives} />
}

// ❌ JAMAIS — API Route pour mutation simple
// app/api/objectives/[id]/route.ts
export async function PUT(req: Request) { ... }

// ✅ TOUJOURS — Server Action pour mutation
// app/dashboard/objectives/[id]/actions.ts
'use server'
export async function updateObjectiveAction(formData: FormData) { ... }

// ❌ JAMAIS — Logique métier dans les composants
function ObjectiveCard({ objective }) {
  const status = objective.current >= objective.target * 0.9 ? 'ON_TRACK' : 'AT_RISK'
}

// ✅ TOUJOURS — Logique dans lib/
import { calculateObjectiveStatus } from '@/lib/objective-status'
function ObjectiveCard({ objective }) {
  const status = calculateObjectiveStatus(objective)
}

// ❌ JAMAIS — Hardcoder des strings UI
<Button>Save</Button>

// ✅ TOUJOURS — Français, descriptif
<Button>Enregistrer la mesure</Button>

// ❌ JAMAIS — Prisma client dans Client Component
'use client'
import { prisma } from '@/lib/prisma' // ERREUR!

// ✅ TOUJOURS — Prisma uniquement côté serveur
// Dans Server Component ou Server Action
```

---

**Ce document doit être fourni à Claude Code au début de chaque session de développement C4DENCE.**
