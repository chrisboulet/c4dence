# 📐 C4DENCE — Conventions de Code

**Version** : 1.0  
**Date** : 30 novembre 2025  
**Usage** : À inclure dans le contexte de Claude Code pour garantir la cohérence

---

## 1. Langue et Nommage

### 1.1 Règle générale

| Élément | Langue | Exemple |
|---------|--------|---------|
| Code (variables, fonctions, types) | **Anglais** | `getWeeklyMeasures()`, `WigStatus` |
| Commentaires | **Français** | `// Calcule le statut selon les seuils 4DX` |
| UI (labels, messages) | **Français** | `"Objectif ambitieux"`, `"Mesure prédictive"` |
| Noms de fichiers | **Anglais** | `wig-card.tsx`, `weekly-measure.ts` |
| Commits | **Français** | `feat: ajout du scoreboard WIG` |

### 1.2 Conventions de casing

```typescript
// PascalCase — Types, Interfaces, Components, Enums
type WigStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
interface LeadMeasure { ... }
function WigCard() { ... }
enum EngagementStatus { ... }

// camelCase — Variables, fonctions, props
const currentWeek = getISOWeek(new Date())
function calculateWigStatus(wig: Wig): WigStatus { ... }
<WigCard wigId={selectedWig} onSelect={handleSelect} />

// SCREAMING_SNAKE_CASE — Constantes, Enum values
const MAX_LEAD_MEASURES_PER_WIG = 3
const DEFAULT_CADENCE_DAY = 'MONDAY'

// kebab-case — Fichiers, dossiers, CSS classes
src/components/wig-card.tsx
src/app/wig/[id]/page.tsx
className="wig-card-header"

// snake_case — Colonnes base de données (Prisma)
model Wig {
  id            String   @id
  created_at    DateTime @default(now())
  organization_id String
}
```

### 1.3 Préfixes et suffixes

```typescript
// Hooks personnalisés — préfixe "use"
function useWigStatus(wigId: string) { ... }
function useWeeklyMeasures(leadMeasureId: string) { ... }

// Server Actions — suffixe "Action"
async function updateMeasureAction(formData: FormData) { ... }
async function createEngagementAction(data: EngagementInput) { ... }

// Types de props — suffixe "Props"
interface WigCardProps { ... }
interface ScoreboardProps { ... }

// Types de réponse — suffixe "Result" ou "Response"
type UpdateMeasureResult = { success: boolean; error?: string }

// Schemas Zod — suffixe "Schema"
const CreateWigSchema = z.object({ ... })
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
│   │   └── register/
│   ├── (dashboard)/          # Route group — pages protégées
│   │   ├── layout.tsx        # Layout avec sidebar
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── wig/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Server Component
│   │   │   │   ├── actions.ts        # Server Actions
│   │   │   │   └── _components/      # Client Components colocalisés
│   │   │   │       ├── lead-measure-table.tsx
│   │   │   │       └── weekly-input.tsx
│   │   │   └── new/
│   │   └── settings/
│   ├── api/                  # API Routes (minimal)
│   │   └── webhooks/         # Uniquement webhooks externes
│   ├── layout.tsx            # Root layout
│   └── globals.css
│
├── components/               # Composants réutilisables
│   ├── ui/                   # shadcn/ui (ne pas modifier)
│   ├── charts/               # Composants Tremor customisés
│   │   ├── beat-the-goat.tsx
│   │   └── trend-indicator.tsx
│   ├── forms/                # Composants formulaire
│   │   ├── wig-form.tsx
│   │   └── measure-input.tsx
│   └── layout/               # Composants layout
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── nav-link.tsx
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
│       ├── wig.ts
│       └── measure.ts
│
├── hooks/                    # Custom hooks
│   ├── use-wig-status.ts
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
src/app/(dashboard)/wig/[id]/
├── page.tsx                    // Server Component principal
├── actions.ts                  // Server Actions
├── loading.tsx                 // Loading state
├── error.tsx                   // Error boundary
└── _components/                // Underscore = ignoré par le router
    ├── lead-measure-table.tsx  // Client Component
    └── weekly-input.tsx        // Client Component

// ❌ MAUVAIS — Tout dans /components global
src/components/
├── wig-page-lead-measure-table.tsx  // Trop spécifique pour être global
└── wig-page-weekly-input.tsx
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
import { WigCard } from '@/components/wig-card'
import { LeadMeasureTable } from './_components/lead-measure-table'

// 5. Lib et utils
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { calculateWigStatus } from '@/lib/wig-status'

// 6. Types
import type { Wig, LeadMeasure } from '@prisma/client'
import type { WigWithMeasures } from '@/types/database'
```

---

## 3. Patterns React Server Components

### 3.1 Règle d'or : Server First

```typescript
// ✅ PAR DÉFAUT — Server Component (pas de directive)
// src/app/(dashboard)/wig/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { LeadMeasureTable } from './_components/lead-measure-table'

export default async function WigPage({ params }: { params: { id: string } }) {
  // Fetch direct avec Prisma — pas de useEffect, pas de useState
  const wig = await prisma.wig.findUnique({
    where: { id: params.id },
    include: {
      leadMeasures: {
        include: { weeklyMeasures: true }
      }
    }
  })
  
  if (!wig) redirect('/dashboard')
  
  return (
    <div>
      <h1>{wig.name}</h1>
      {/* Client Component reçoit les données pré-fetchées */}
      <LeadMeasureTable 
        leadMeasures={wig.leadMeasures} 
        wigId={wig.id}
      />
    </div>
  )
}

// ✅ CLIENT COMPONENT — Uniquement si interactivité requise
// src/app/(dashboard)/wig/[id]/_components/lead-measure-table.tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMeasureAction } from '../actions'

interface LeadMeasureTableProps {
  leadMeasures: LeadMeasureWithWeekly[]
  wigId: string
}

export function LeadMeasureTable({ leadMeasures, wigId }: LeadMeasureTableProps) {
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
// src/app/(dashboard)/wig/[id]/actions.ts
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
        wig: {
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
    revalidatePath(`/wig/${leadMeasure.wigId}`)
    
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
// src/app/(dashboard)/wig/[id]/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function WigError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log vers service de monitoring (Sentry, etc.)
    console.error('WIG Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="text-muted-foreground">
        Impossible de charger cet objectif ambitieux.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  )
}
```

### 4.3 Loading States

```typescript
// src/app/(dashboard)/wig/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function WigLoading() {
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
  wigs        Wig[]
  
  // Mapping vers snake_case pour PostgreSQL
  @@map("organizations")
}

// Enum en SCREAMING_SNAKE_CASE
enum WigStatus {
  ON_TRACK
  AT_RISK
  OFF_TRACK
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
const wig = await prisma.wig.findUnique({
  where: { id: wigId },
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
const wig = await prisma.wig.findUnique({
  where: { id: wigId },
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
│   │   └── wig-status.test.ts
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
    └── wig-flow.spec.ts
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
feat(wig): ajout de la page scoreboard
fix(measure): correction du calcul hebdomadaire
docs: mise à jour du README avec instructions Supabase
refactor(auth): migration vers @supabase/ssr
test(wig-status): ajout des cas limites
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
feat/wig-scoreboard
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
const data: WigResponse = await fetch(...)

// ❌ JAMAIS — Fetch dans useEffect pour data initiale
useEffect(() => {
  fetch('/api/wigs').then(...)
}, [])

// ✅ TOUJOURS — Server Component pour data initiale
export default async function Page() {
  const wigs = await prisma.wig.findMany(...)
  return <WigList wigs={wigs} />
}

// ❌ JAMAIS — API Route pour mutation simple
// app/api/wig/[id]/route.ts
export async function PUT(req: Request) { ... }

// ✅ TOUJOURS — Server Action pour mutation
// app/wig/[id]/actions.ts
'use server'
export async function updateWigAction(formData: FormData) { ... }

// ❌ JAMAIS — Logique métier dans les composants
function WigCard({ wig }) {
  const status = wig.current >= wig.target * 0.9 ? 'ON_TRACK' : 'AT_RISK'
}

// ✅ TOUJOURS — Logique dans lib/
import { calculateWigStatus } from '@/lib/wig-status'
function WigCard({ wig }) {
  const status = calculateWigStatus(wig)
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
