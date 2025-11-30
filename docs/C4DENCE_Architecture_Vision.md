# 🎯 C4DENCE
## Vision Architecturale — Application de Gestion d'Exécution Stratégique

**Nom** : C4DENCE  
**Tagline FR** : Le rythme de votre exécution  
**Tagline EN** : The rhythm of your execution  

**Version** : 2.0 (Revue critique novembre 2025)  
**Date** : 30 novembre 2025  
**Auteur** : Boulet Stratégies TI  
**Statut** : Architecture validée, prêt pour développement

---

## 1. Résumé Exécutif

### Le Problème
En tant que Fractional CTO servant plusieurs clients PME, tu dois :
1. **Gérer ta propre exécution** vers l'objectif 12K$/mois
2. **Accompagner chaque client** dans leur propre exécution 4DX
3. **Maintenir une visibilité instantanée** sur tous les WIGs actifs
4. **Éviter la dispersion TDAH** avec des outils simples et dopaminergiques

### La Solution
**C4DENCE** — Une application web légère qui centralise :
- Tous tes WIGs (personnel + clients)
- Les Lead Measures avec tracking hebdomadaire
- Les Scoreboards visuels en temps réel
- La cadence de réunions et engagements

### Différenciateur Clé
Cette application est **TDAH-optimisée** : pas de features inutiles, friction minimale, gamification intelligente pour maintenir l'engagement.

### Stack Technique (Validée novembre 2025)

```
┌─────────────────────────────────────────────────────────────┐
│                     STACK C4DENCE v2                         │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND                                                    │
│  ├─ Next.js 15.5 (App Router, Turbopack)                    │
│  ├─ React 19 (Server Components par défaut)                 │
│  ├─ Tailwind CSS 3.4                                        │
│  ├─ shadcn/ui (composants de base)                          │
│  └─ Tremor (charts + dashboard components)                  │
│                                                              │
│  DATA LAYER                                                  │
│  ├─ Prisma 6 (ORM)                                          │
│  ├─ TanStack Query 5 (cache client + optimistic updates)   │
│  └─ Server Actions (mutations)                              │
│                                                              │
│  BACKEND                                                     │
│  ├─ Supabase PostgreSQL                                     │
│  ├─ Supabase Auth (@supabase/ssr)                           │
│  └─ Row Level Security (multi-tenant)                       │
│                                                              │
│  DEPLOY                                                      │
│  └─ Vercel (Edge Network, Turbopack)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Persona et Cas d'Usage

### Persona Principal : Christian (Toi)
- **Rôle** : Fractional CTO gérant 2-4 clients simultanément
- **Besoin** : Vue d'ensemble instantanée + drill-down par client
- **Contrainte TDAH** : Doit voir "on gagne ou on perd" en 5 secondes

### Persona Secondaire : Client PME
- **Rôle** : PDG/DG d'une PME 10M$+ (ex: FLB, ERA)
- **Besoin** : Son propre scoreboard visible par son équipe
- **Contrainte** : Pas tech-savvy, doit être ultra-simple

### Cas d'Usage Prioritaires

| # | Cas d'Usage | Fréquence | Criticité |
|---|-------------|-----------|-----------|
| 1 | Voir tous mes WIGs et leur statut vert/jaune/rouge | Quotidien | 🔴 Haute |
| 2 | Mettre à jour un Lead Measure (valeur hebdo) | Hebdo | 🔴 Haute |
| 3 | Préparer une réunion WIG (agenda auto-généré) | Hebdo | 🟡 Moyenne |
| 4 | Créer/modifier un WIG pour un nouveau client | Mensuel | 🟡 Moyenne |
| 5 | Voir l'historique de progression d'un WIG | Ponctuel | 🟢 Basse |
| 6 | Exporter un rapport pour le comité de direction | Mensuel | 🟢 Basse |

---

## 3. Architecture Fonctionnelle

### 3.1 Modèle de Données Conceptuel

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORGANISATION                            │
│  (Boulet Stratégies TI ou Client PME)                          │
│  - id, nom, logo, couleur_primaire                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                             WIG                                 │
│  (Wildly Important Goal)                                        │
│  - id, organisation_id                                          │
│  - titre                                                        │
│  - valeur_depart (X)                                            │
│  - valeur_cible (Y)                                             │
│  - unite (%, $, jours, etc.)                                    │
│  - date_debut                                                   │
│  - date_cible                                                   │
│  - valeur_actuelle                                              │
│  - statut (vert/jaune/rouge/atteint)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LEAD MEASURE                             │
│  - id, wig_id                                                   │
│  - description                                                  │
│  - cible_hebdo                                                  │
│  - unite                                                        │
│  - responsable                                                  │
│  - type (comportement | petit_résultat)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MESURE_HEBDOMADAIRE                          │
│  - id, lead_measure_id                                          │
│  - semaine (YYYY-WNN)                                           │
│  - valeur_realisee                                              │
│  - note (optionnel)                                             │
│  - date_saisie                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ENGAGEMENT                               │
│  - id, wig_id                                                   │
│  - semaine                                                      │
│  - description                                                  │
│  - responsable                                                  │
│  - statut (en_cours | fait | non_fait)                          │
│  - raison_non_fait (optionnel)                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       REUNION_WIG                               │
│  - id, wig_id                                                   │
│  - date_heure                                                   │
│  - participants[]                                               │
│  - notes_deblocage                                              │
│  - engagements_semaine[] (→ ENGAGEMENT)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Hiérarchie des Écrans

```
┌─────────────────────────────────────────────────────────────────┐
│                     🏠 DASHBOARD GLOBAL                         │
│  "Command Center" — Vue d'ensemble de tous les WIGs             │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 🟢 Mon WIG   │ │ 🟡 FLB       │ │ 🟢 ERA       │            │
│  │ Revenus 12K$ │ │ Migration ERP│ │ Transfo Num. │            │
│  │ ████████░░ 80%│ │ ████░░░░░ 45%│ │ █████████░ 92%│           │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  [Cette semaine] 3 engagements à rendre compte                  │
│  [Prochaine réunion] FLB - Lundi 10h                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Clic sur un WIG
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     📊 SCOREBOARD WIG                           │
│  Vue détaillée d'un WIG spécifique                              │
│                                                                 │
│  WIG: De 0$ à 12K$/mois d'ici 31 mars 2026                      │
│  ════════════════════════════════════════                        │
│  Progression: ████████░░░░░░░░░░ 8K$ (67%)                      │
│                                                                 │
│  LEAD MEASURES                        S48   S49   S50   S51     │
│  ─────────────────────────────────────────────────────────────  │
│  📞 Appels prospects (cible: 5)       [3]   [5]   [4]   [ ]     │
│  📄 Propositions envoyées (cible: 2)  [2]   [1]   [2]   [ ]     │
│                                                                 │
│  ENGAGEMENTS CETTE SEMAINE                                      │
│  ─────────────────────────────────────────────────────────────  │
│  ☑️ Appeler Marc Veilleux (ESI)                                 │
│  ☐ Envoyer proposition ERA                                      │
│  ☐ Relancer FLB sur retainer                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Bouton "Préparer réunion WIG"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     📋 RÉUNION WIG                              │
│  Mode facilitateur pour la réunion hebdo                        │
│                                                                 │
│  1️⃣ RAPPORT (5 min)                                            │
│     → Liste des engagements de la semaine passée                │
│     → Boutons "Fait ✓" / "Pas fait ✗" avec raison               │
│                                                                 │
│  2️⃣ SCORE (5 min)                                              │
│     → Scoreboard actuel avec champs de saisie                   │
│     → "On gagne 🎉" ou "On perd 😤"                              │
│                                                                 │
│  3️⃣ DÉBLOCAGE (10 min)                                         │
│     → Zone de notes libres                                      │
│     → Suggestions IA basées sur les patterns                    │
│                                                                 │
│  4️⃣ ENGAGEMENTS (5 min)                                        │
│     → Ajout rapide d'engagements pour la semaine                │
│     → Attribution automatique au responsable                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Architecture Technique

### 4.1 Pourquoi ce Stack? (Validations novembre 2025)

| Composant | Choix | Justification |
|-----------|-------|---------------|
| **Next.js 15.5** | Framework | Turbopack stable, React 19 natif, Server Actions, typed routes |
| **React 19** | UI | Server Components par défaut, hook `use()`, React Compiler |
| **Prisma 6** | ORM | Type-checking rapide (précompilé), migrations robustes, DX mature |
| **Supabase** | Backend | PostgreSQL + Auth + RLS gratuit, parfait multi-tenant |
| **TanStack Query 5** | Cache | Standard industrie pour cache client + optimistic updates |
| **shadcn/ui** | Composants base | Copy-paste, pas de lock-in, Tailwind-native |
| **Tremor** | Charts/Dashboard | Wrapper Recharts + composants dashboard prêts à l'emploi |
| **Vercel** | Hosting | Zero-config, Turbopack natif, preview deployments |

### 4.2 Patterns 2025 : RSC-First

**Principe** : Server Components par défaut, Client Components uniquement pour l'interactivité.

```
┌─────────────────────────────────────────────────────────────────┐
│              PATTERN RSC-FIRST (NEXT.JS 15)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SERVER COMPONENTS (par défaut)                                  │
│  └─ Fetch direct avec Prisma (await prisma.wig.findMany())      │
│     └─ Pas de TanStack Query côté serveur                       │
│     └─ HTML pré-rendu, zéro JS envoyé au client                 │
│                                                                  │
│  SERVER ACTIONS (mutations)                                      │
│  └─ 'use server' pour CREATE/UPDATE/DELETE                      │
│     └─ Remplace les API Routes traditionnelles                  │
│     └─ Type-safe de bout en bout                                │
│                                                                  │
│  CLIENT COMPONENTS (interactivité uniquement)                    │
│  └─ 'use client' en haut du fichier                             │
│     └─ TanStack Query pour :                                    │
│        - Cache client-side                                      │
│        - Optimistic updates                                     │
│        - Background refetch                                     │
│        - Polling temps réel                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Flux de Données

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    BROWSER                     SERVER                  DATABASE  │
│                                                                  │
│  ┌──────────┐              ┌──────────┐             ┌─────────┐ │
│  │  React   │   Request    │ Next.js  │   Prisma   │Supabase │ │
│  │  Client  │ ──────────▶ │  RSC     │ ─────────▶ │PostgreSQL│ │
│  │Components│              │          │             │         │ │
│  └──────────┘              └──────────┘             └─────────┘ │
│       │                          │                       │      │
│       │     HTML + RSC Payload   │                       │      │
│       │ ◀────────────────────────│                       │      │
│       │                          │                       │      │
│  ┌──────────┐              ┌──────────┐                         │
│  │ TanStack │   Mutation   │ Server   │                         │
│  │  Query   │ ──────────▶ │ Action   │ ────────────────────────▶│
│  │  Cache   │              │'use      │                         │
│  └──────────┘              │ server'  │                         │
│       │                    └──────────┘                         │
│       │  revalidatePath()       │                               │
│       │ ◀───────────────────────│                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.4 Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "relationJoins"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// USERS & AUTH (synced with Supabase Auth)
// ============================================

model Profile {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  fullName  String?  @map("full_name")
  avatarUrl String?  @map("avatar_url")
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  memberships   OrgMembership[]
  engagements   Engagement[]
  leadMeasures  LeadMeasure[]   @relation("LeadMeasureOwner")

  @@map("profiles")
}

enum Role {
  SUPER_ADMIN  // Christian - voit tout
  ADMIN        // Admin d'une organisation
  MEMBER       // Membre standard
}

// ============================================
// ORGANISATIONS (Multi-tenant)
// ============================================

model Organization {
  id           String   @id @default(uuid()) @db.Uuid
  name         String
  slug         String   @unique
  logoUrl      String?  @map("logo_url")
  primaryColor String?  @default("#3B82F6") @map("primary_color")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  memberships OrgMembership[]
  wigs        Wig[]

  @@map("organizations")
}

model OrgMembership {
  id             String       @id @default(uuid()) @db.Uuid
  profileId      String       @map("profile_id") @db.Uuid
  organizationId String       @map("organization_id") @db.Uuid
  role           OrgRole      @default(MEMBER)
  createdAt      DateTime     @default(now()) @map("created_at")

  // Relations
  profile      Profile      @relation(fields: [profileId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([profileId, organizationId])
  @@map("org_memberships")
}

enum OrgRole {
  OWNER   // Propriétaire de l'organisation
  ADMIN   // Peut tout gérer
  MEMBER  // Peut voir et mettre à jour
  VIEWER  // Lecture seule
}

// ============================================
// 4DX CORE: WIG, Lead Measures, Engagements
// ============================================

model Wig {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  
  // WIG Definition: "De X à Y d'ici [date]"
  title          String
  description    String?
  startValue     Float     @map("start_value")
  targetValue    Float     @map("target_value")
  currentValue   Float     @default(0) @map("current_value")
  unit           String    @default("%")
  
  // Timeline
  startDate      DateTime  @map("start_date")
  targetDate     DateTime  @map("target_date")
  
  // Status (calculated, but cached for performance)
  status         WigStatus @default(ON_TRACK)
  
  // Metadata
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  leadMeasures LeadMeasure[]
  engagements  Engagement[]
  meetings     WigMeeting[]

  @@index([organizationId])
  @@index([status])
  @@map("wigs")
}

enum WigStatus {
  ON_TRACK   // 🟢 Vert - ratio >= 0.9
  AT_RISK    // 🟡 Jaune - ratio >= 0.7
  OFF_TRACK  // 🔴 Rouge - ratio < 0.7
  ACHIEVED   // ✅ Atteint - currentValue >= targetValue
  PAUSED     // ⏸️ En pause
}

model LeadMeasure {
  id          String          @id @default(uuid()) @db.Uuid
  wigId       String          @map("wig_id") @db.Uuid
  
  // Definition
  description String
  targetPerWeek Float         @map("target_per_week")
  unit        String          @default("count")
  
  // Type: Behavior (ex: "Faire 5 appels") vs Small Outcome (ex: "Obtenir 2 RDV")
  type        LeadMeasureType @default(BEHAVIOR)
  
  // Owner
  ownerId     String?         @map("owner_id") @db.Uuid
  
  // Metadata
  isActive    Boolean         @default(true) @map("is_active")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  // Relations
  wig            Wig             @relation(fields: [wigId], references: [id], onDelete: Cascade)
  owner          Profile?        @relation("LeadMeasureOwner", fields: [ownerId], references: [id])
  weeklyMeasures WeeklyMeasure[]

  @@index([wigId])
  @@map("lead_measures")
}

enum LeadMeasureType {
  BEHAVIOR      // Action directe (ex: "Faire 5 appels")
  SMALL_OUTCOME // Petit résultat (ex: "Obtenir 2 RDV")
}

model WeeklyMeasure {
  id            String   @id @default(uuid()) @db.Uuid
  leadMeasureId String   @map("lead_measure_id") @db.Uuid
  
  // Week identifier (ISO format: "2025-W48")
  weekCode      String   @map("week_code")
  
  // Actual value achieved
  value         Float
  
  // Optional note
  note          String?
  
  // Metadata
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  leadMeasure LeadMeasure @relation(fields: [leadMeasureId], references: [id], onDelete: Cascade)

  @@unique([leadMeasureId, weekCode])
  @@index([weekCode])
  @@map("weekly_measures")
}

model Engagement {
  id          String           @id @default(uuid()) @db.Uuid
  wigId       String           @map("wig_id") @db.Uuid
  
  // Week this engagement is for
  weekCode    String           @map("week_code")
  
  // Definition
  description String
  
  // Owner
  ownerId     String?          @map("owner_id") @db.Uuid
  
  // Status
  status      EngagementStatus @default(PENDING)
  
  // If not done, why?
  notDoneReason String?        @map("not_done_reason")
  
  // Metadata
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  // Relations
  wig   Wig      @relation(fields: [wigId], references: [id], onDelete: Cascade)
  owner Profile? @relation(fields: [ownerId], references: [id])

  @@index([wigId, weekCode])
  @@map("engagements")
}

enum EngagementStatus {
  PENDING   // En cours
  DONE      // ✅ Fait
  NOT_DONE  // ❌ Pas fait (raison requise)
}

model WigMeeting {
  id            String   @id @default(uuid()) @db.Uuid
  wigId         String   @map("wig_id") @db.Uuid
  
  // When
  weekCode      String   @map("week_code")
  scheduledAt   DateTime @map("scheduled_at")
  
  // Notes from the meeting
  deblocageNotes String? @map("deblocage_notes")
  
  // Metadata
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  wig Wig @relation(fields: [wigId], references: [id], onDelete: Cascade)

  @@unique([wigId, weekCode])
  @@map("wig_meetings")
}
```

### 4.5 Row Level Security (RLS) Policies

```sql
-- ============================================
-- RLS POLICIES (à exécuter dans Supabase SQL Editor)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE wigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wig_meetings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS
-- ============================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM org_memberships 
      WHERE profile_id = auth.uid()
    )
  );

-- Super admin (Christian) can view all
CREATE POLICY "Super admin can view all orgs" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================
-- WIGS
-- ============================================

-- Users can view WIGs of their organizations
CREATE POLICY "Users can view org WIGs" ON wigs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM org_memberships 
      WHERE profile_id = auth.uid()
    )
  );

-- Users can update WIGs of their organizations (if ADMIN or OWNER)
CREATE POLICY "Admins can update org WIGs" ON wigs
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM org_memberships 
      WHERE profile_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Super admin can do everything
CREATE POLICY "Super admin full access to WIGs" ON wigs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Similar policies for lead_measures, weekly_measures, engagements, wig_meetings...
-- (Pattern: check org_membership via parent wig)
```

### 4.6 Algorithme de Calcul du Statut WIG

```typescript
// lib/wig-status.ts

import { differenceInDays, parseISO } from 'date-fns'

type WigStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'ACHIEVED' | 'PAUSED'

interface WigData {
  startValue: number
  targetValue: number
  currentValue: number
  startDate: string | Date
  targetDate: string | Date
  isActive: boolean
}

export function calculateWigStatus(wig: WigData): WigStatus {
  // Paused WIGs
  if (!wig.isActive) return 'PAUSED'
  
  // Already achieved
  const totalChange = wig.targetValue - wig.startValue
  const actualChange = wig.currentValue - wig.startValue
  if (actualChange >= totalChange) return 'ACHIEVED'
  
  // Calculate expected progress based on time elapsed
  const startDate = typeof wig.startDate === 'string' ? parseISO(wig.startDate) : wig.startDate
  const targetDate = typeof wig.targetDate === 'string' ? parseISO(wig.targetDate) : wig.targetDate
  const today = new Date()
  
  const totalDays = differenceInDays(targetDate, startDate)
  const elapsedDays = differenceInDays(today, startDate)
  
  // Avoid division by zero
  if (totalDays <= 0) return 'ON_TRACK'
  
  const expectedProgress = Math.min(elapsedDays / totalDays, 1)
  const actualProgress = totalChange !== 0 ? actualChange / totalChange : 0
  
  // Calculate ratio: how well are we tracking vs expected?
  const ratio = expectedProgress > 0 ? actualProgress / expectedProgress : 1
  
  // Status thresholds
  if (ratio >= 0.9) return 'ON_TRACK'   // 🟢 90%+ of expected
  if (ratio >= 0.7) return 'AT_RISK'    // 🟡 70-90% of expected
  return 'OFF_TRACK'                     // 🔴 <70% of expected
}

// For "Beat the GOAT" chart - calculate ideal progression
export function calculateIdealProgression(
  wig: WigData, 
  weekCodes: string[]
): Array<{ weekCode: string; ideal: number }> {
  const startDate = typeof wig.startDate === 'string' ? parseISO(wig.startDate) : wig.startDate
  const targetDate = typeof wig.targetDate === 'string' ? parseISO(wig.targetDate) : wig.targetDate
  const totalDays = differenceInDays(targetDate, startDate)
  const totalChange = wig.targetValue - wig.startValue
  
  return weekCodes.map(weekCode => {
    // Parse week code to get date (Monday of that week)
    const [year, week] = weekCode.split('-W').map(Number)
    const weekDate = getDateOfISOWeek(week, year)
    const elapsedDays = differenceInDays(weekDate, startDate)
    const progress = Math.min(elapsedDays / totalDays, 1)
    
    return {
      weekCode,
      ideal: wig.startValue + (totalChange * progress)
    }
  })
}

// Helper: Get Monday of ISO week
function getDateOfISOWeek(week: number, year: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  return monday
}
```

---

## 5. Structure du Projet

### 5.1 Arborescence Recommandée

```
c4dence/
├── .env.local                 # Variables Supabase + secrets
├── .env.example               # Template pour onboarding
├── next.config.ts             # TypeScript config (Next.js 15)
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts              # Auth middleware (racine)
│
├── prisma/
│   ├── schema.prisma          # Modèle de données
│   ├── migrations/            # Historique migrations
│   └── seed.ts                # Données de test
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── page.tsx           # Dashboard (Server Component)
│   │   ├── loading.tsx        # Global loading skeleton
│   │   ├── error.tsx          # Global error boundary
│   │   ├── not-found.tsx
│   │   │
│   │   ├── (auth)/            # Route group (pas dans l'URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts   # OAuth callback
│   │   │
│   │   ├── wig/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx           # WIG Scoreboard (Server)
│   │   │   │   ├── loading.tsx        # Streaming skeleton
│   │   │   │   ├── actions.ts         # Server Actions
│   │   │   │   ├── _components/       # Composants colocalisés
│   │   │   │   │   ├── Scoreboard.tsx
│   │   │   │   │   ├── BeatTheGoat.tsx
│   │   │   │   │   ├── LeadMeasureTable.tsx
│   │   │   │   │   └── EngagementList.tsx
│   │   │   │   └── meeting/
│   │   │   │       ├── page.tsx
│   │   │   │       └── _components/
│   │   │   │           ├── MeetingFlow.tsx
│   │   │   │           ├── ReportStep.tsx
│   │   │   │           ├── ScoreStep.tsx
│   │   │   │           ├── DeblocageStep.tsx
│   │   │   │           └── CommitStep.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui (Button, Card, etc.)
│   │   ├── layout/            # Header, Sidebar, etc.
│   │   └── shared/            # WigCard, StatusBadge, etc.
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client (RSC)
│   │   │   └── middleware.ts
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── queries.ts         # Prisma queries réutilisables
│   │   ├── wig-status.ts      # Calcul statut WIG
│   │   ├── week-utils.ts      # Helpers ISO week
│   │   └── utils.ts           # cn() et autres helpers
│   │
│   ├── hooks/                 # Client-side hooks
│   │   ├── use-wig.ts
│   │   └── use-current-week.ts
│   │
│   └── types/
│       └── index.ts
│
└── public/
    └── ...
```

### 5.2 Commandes de Démarrage

```bash
# 1. Créer le projet Next.js 15.5
npx create-next-app@latest c4dence \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --import-alias "@/*"

# 2. Installer les dépendances
cd c4dence

# Core
npm install @supabase/supabase-js @supabase/ssr
npm install @prisma/client prisma
npm install @tanstack/react-query

# UI
npm install @tremor/react
npm install lucide-react

# Utils
npm install date-fns zod react-hook-form @hookform/resolvers
npm install class-variance-authority clsx tailwind-merge

# 3. Setup shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label dialog tabs badge progress avatar dropdown-menu

# 4. Setup Prisma
npx prisma init
# → Copier le schema.prisma de ce document
# → Configurer .env.local avec DATABASE_URL

# 5. Dev avec Turbopack
npm run dev
```

### 5.3 Package.json Recommandé

```json
{
  "name": "c4dence",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@prisma/client": "^6.0.0",
    "@tanstack/react-query": "^5.60.0",
    "@tremor/react": "^3.18.0",
    "date-fns": "^4.1.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "tsx": "^4.19.0"
  }
}
```

---

## 6. Exemples de Code

### 6.1 Supabase Auth avec @supabase/ssr

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// middleware.ts (racine du projet)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 6.2 Server Component avec Prisma Direct

```typescript
// app/page.tsx - Dashboard (Server Component)
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { WigCard } from '@/components/shared/WigCard'
import { Card, Metric, Text, Grid } from '@tremor/react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Fetch WIGs directly with Prisma (Server Component)
  const wigs = await prisma.wig.findMany({
    where: {
      organization: {
        memberships: {
          some: { profileId: user.id }
        }
      },
      isActive: true
    },
    include: {
      organization: true,
      leadMeasures: {
        include: {
          weeklyMeasures: {
            orderBy: { weekCode: 'desc' },
            take: 4
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
  
  // Stats
  const stats = {
    total: wigs.length,
    onTrack: wigs.filter(w => w.status === 'ON_TRACK').length,
    atRisk: wigs.filter(w => w.status === 'AT_RISK').length,
    offTrack: wigs.filter(w => w.status === 'OFF_TRACK').length,
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Command Center</h1>
      
      {/* Quick Stats with Tremor */}
      <Grid numItemsMd={4} className="gap-4">
        <Card>
          <Text>Total WIGs</Text>
          <Metric>{stats.total}</Metric>
        </Card>
        <Card decoration="top" decorationColor="green">
          <Text>On Track</Text>
          <Metric>{stats.onTrack}</Metric>
        </Card>
        <Card decoration="top" decorationColor="yellow">
          <Text>At Risk</Text>
          <Metric>{stats.atRisk}</Metric>
        </Card>
        <Card decoration="top" decorationColor="red">
          <Text>Off Track</Text>
          <Metric>{stats.offTrack}</Metric>
        </Card>
      </Grid>
      
      {/* WIG Cards */}
      <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
        {wigs.map(wig => (
          <WigCard key={wig.id} wig={wig} />
        ))}
      </Grid>
    </div>
  )
}
```

### 6.3 Server Action pour Mutation

```typescript
// app/wig/[id]/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateMeasureSchema = z.object({
  leadMeasureId: z.string().uuid(),
  weekCode: z.string().regex(/^\d{4}-W\d{2}$/),
  value: z.number().min(0),
})

export async function updateWeeklyMeasure(formData: FormData) {
  const parsed = updateMeasureSchema.parse({
    leadMeasureId: formData.get('leadMeasureId'),
    weekCode: formData.get('weekCode'),
    value: Number(formData.get('value')),
  })

  const result = await prisma.weeklyMeasure.upsert({
    where: {
      leadMeasureId_weekCode: {
        leadMeasureId: parsed.leadMeasureId,
        weekCode: parsed.weekCode,
      }
    },
    update: { value: parsed.value },
    create: {
      leadMeasureId: parsed.leadMeasureId,
      weekCode: parsed.weekCode,
      value: parsed.value,
    },
  })

  // Get WIG ID for revalidation
  const leadMeasure = await prisma.leadMeasure.findUnique({
    where: { id: parsed.leadMeasureId },
    select: { wigId: true }
  })

  if (leadMeasure) {
    revalidatePath(`/wig/${leadMeasure.wigId}`)
  }

  return result
}

export async function updateEngagementStatus(
  engagementId: string, 
  status: 'DONE' | 'NOT_DONE',
  notDoneReason?: string
) {
  const result = await prisma.engagement.update({
    where: { id: engagementId },
    data: { 
      status,
      notDoneReason: status === 'NOT_DONE' ? notDoneReason : null
    },
  })

  revalidatePath(`/wig/${result.wigId}`)
  return result
}
```

### 6.4 Client Component avec TanStack Query

```typescript
// app/wig/[id]/_components/LeadMeasureTable.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWeeklyMeasure } from '../actions'
import { useState } from 'react'
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react'
import { Check } from 'lucide-react'

interface LeadMeasureTableProps {
  wigId: string
  leadMeasures: Array<{
    id: string
    description: string
    targetPerWeek: number
    unit: string
    weeklyMeasures: Array<{
      weekCode: string
      value: number
    }>
  }>
  weekCodes: string[] // ["2025-W48", "2025-W49", ...]
}

export function LeadMeasureTable({ wigId, leadMeasures, weekCodes }: LeadMeasureTableProps) {
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<string | null>(null)
  
  const mutation = useMutation({
    mutationFn: async (data: { leadMeasureId: string; weekCode: string; value: number }) => {
      const formData = new FormData()
      formData.set('leadMeasureId', data.leadMeasureId)
      formData.set('weekCode', data.weekCode)
      formData.set('value', data.value.toString())
      return updateWeeklyMeasure(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wig', wigId] })
    }
  })

  const getValue = (lm: typeof leadMeasures[0], weekCode: string) => {
    return lm.weeklyMeasures.find(w => w.weekCode === weekCode)?.value
  }

  const isOnTarget = (value: number | undefined, target: number) => {
    return value !== undefined && value >= target
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Lead Measure</TableHeaderCell>
          <TableHeaderCell>Target</TableHeaderCell>
          {weekCodes.map(week => (
            <TableHeaderCell key={week}>{week.split('-')[1]}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {leadMeasures.map(lm => (
          <TableRow key={lm.id}>
            <TableCell>{lm.description}</TableCell>
            <TableCell>
              <Badge color="gray">{lm.targetPerWeek} {lm.unit}</Badge>
            </TableCell>
            {weekCodes.map(weekCode => {
              const value = getValue(lm, weekCode)
              const cellKey = `${lm.id}-${weekCode}`
              const isEditing = editingCell === cellKey
              
              return (
                <TableCell key={weekCode}>
                  {isEditing ? (
                    <input
                      type="number"
                      defaultValue={value ?? ''}
                      autoFocus
                      className="w-16 p-1 border rounded"
                      onBlur={(e) => {
                        const newValue = Number(e.target.value)
                        if (!isNaN(newValue)) {
                          mutation.mutate({ 
                            leadMeasureId: lm.id, 
                            weekCode, 
                            value: newValue 
                          })
                        }
                        setEditingCell(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                        if (e.key === 'Escape') setEditingCell(null)
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingCell(cellKey)}
                      className={`
                        w-12 h-8 rounded flex items-center justify-center
                        ${isOnTarget(value, lm.targetPerWeek) 
                          ? 'bg-green-100 text-green-800' 
                          : value !== undefined 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-400'
                        }
                      `}
                    >
                      {value !== undefined ? (
                        <>
                          {value}
                          {isOnTarget(value, lm.targetPerWeek) && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </>
                      ) : '—'}
                    </button>
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 6.5 Chart "Beat the GOAT" avec Tremor

```typescript
// app/wig/[id]/_components/BeatTheGoat.tsx
'use client'

import { AreaChart, Card, Title, Badge, Text } from '@tremor/react'
import { calculateIdealProgression } from '@/lib/wig-status'

interface BeatTheGoatProps {
  wig: {
    title: string
    startValue: number
    targetValue: number
    currentValue: number
    startDate: string
    targetDate: string
    unit: string
    status: string
  }
  weeklyProgress: Array<{
    weekCode: string
    actual: number
  }>
}

export function BeatTheGoat({ wig, weeklyProgress }: BeatTheGoatProps) {
  // Calculate ideal trajectory
  const weekCodes = weeklyProgress.map(w => w.weekCode)
  const idealData = calculateIdealProgression(wig, weekCodes)
  
  // Merge actual + ideal for chart
  const chartData = weeklyProgress.map(w => ({
    weekCode: w.weekCode,
    'Réel': w.actual,
    'Cible': idealData.find(i => i.weekCode === w.weekCode)?.ideal ?? 0,
  }))
  
  // Are we winning?
  const latestActual = weeklyProgress.at(-1)?.actual ?? wig.startValue
  const latestIdeal = idealData.at(-1)?.ideal ?? wig.startValue
  const isWinning = latestActual >= latestIdeal
  
  const statusColors = {
    ON_TRACK: 'green',
    AT_RISK: 'yellow', 
    OFF_TRACK: 'red',
    ACHIEVED: 'emerald',
    PAUSED: 'gray',
  } as const

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Title>{wig.title}</Title>
          <Text>
            De {wig.startValue}{wig.unit} à {wig.targetValue}{wig.unit}
          </Text>
        </div>
        <div className="text-right">
          <Badge 
            color={statusColors[wig.status as keyof typeof statusColors] ?? 'gray'}
            size="lg"
          >
            {isWinning ? 'On gagne! 🎉' : 'On perd 😤'}
          </Badge>
          <Text className="mt-1">
            Actuel: <span className="font-bold">{wig.currentValue}{wig.unit}</span>
          </Text>
        </div>
      </div>
      
      <AreaChart
        className="h-72"
        data={chartData}
        index="weekCode"
        categories={['Réel', 'Cible']}
        colors={['blue', 'gray']}
        valueFormatter={(value) => `${value}${wig.unit}`}
        showLegend
        showAnimation
        curveType="monotone"
      />
    </Card>
  )
}
```

---

## 7. Configuration Environnement

### 7.1 Variables d'Environnement (.env.local)

```bash
# ===========================================
# SUPABASE
# ===========================================
# Trouvable dans: Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# DATABASE (Prisma)
# ===========================================
# Trouvable dans: Supabase Dashboard > Settings > Database > Connection string
# ⚠️ Utiliser "Transaction pooler" pour Vercel (port 6543)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Pour les migrations Prisma (connexion directe, port 5432)
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou https://c4dence.bouletstrategies.ca en prod

# ===========================================
# PHASE 3 (Optionnel)
# ===========================================
# ANTHROPIC_API_KEY=sk-ant-...
# RESEND_API_KEY=re_...
```

### 7.2 Configuration Vercel

Dans Vercel Dashboard > Settings > Environment Variables :

| Variable | Environment | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Identique partout |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Identique partout |
| `DATABASE_URL` | Production | Pooled connection |
| `DIRECT_URL` | Production | Direct connection |

### 7.3 Configuration Supabase

**1. Auth Settings** (Authentication > Providers)
```
✅ Email (enabled)
   - Confirm email: ON (recommandé) ou OFF (dev rapide)
   - Secure email change: ON
   
✅ Google (optionnel, Phase 2)
   - Client ID + Secret depuis Google Cloud Console
```

**2. URL Configuration** (Authentication > URL Configuration)
```
Site URL: https://c4dence.bouletstrategies.ca
Redirect URLs:
  - http://localhost:3000/**
  - https://c4dence.bouletstrategies.ca/**
  - https://*.vercel.app/**  (pour les previews)
```

**3. RLS Policies** : Voir section 4.5

---

## 8. Roadmap et Sprints

### Phase 1 : MVP (4-6 semaines, ~40-60h)

#### Sprint 0 — Setup (2-3h)

| # | Action | Temps | Fait |
|---|--------|-------|------|
| 1 | Créer projet Supabase | 10 min | ☐ |
| 2 | Créer repo GitHub `c4dence` | 5 min | ☐ |
| 3 | Connecter Vercel au repo | 5 min | ☐ |
| 4 | `npx create-next-app@latest` avec Next.js 15 | 10 min | ☐ |
| 5 | Installer dépendances (voir commandes) | 10 min | ☐ |
| 6 | Setup shadcn/ui + Tremor | 15 min | ☐ |
| 7 | Configurer Prisma + première migration | 30 min | ☐ |
| 8 | Setup Supabase Auth avec @supabase/ssr | 45 min | ☐ |
| 9 | Créer middleware.ts pour auth | 20 min | ☐ |
| 10 | Premier deploy Vercel | 10 min | ☐ |

#### Sprint 1 — Dashboard (1 semaine, ~10h)

| # | Feature | Priorité |
|---|---------|----------|
| 1 | Page dashboard avec liste WIGs (mockés) | 🔴 |
| 2 | Composant WigCard avec Tremor | 🔴 |
| 3 | Page création WIG (formulaire) | 🔴 |
| 4 | Connexion Prisma → vrais WIGs | 🔴 |
| 5 | Auth obligatoire pour accéder | 🟡 |

#### Sprint 2 — Scoreboard (1 semaine, ~10h)

| # | Feature | Priorité |
|---|---------|----------|
| 1 | Page scoreboard WIG | 🔴 |
| 2 | Graphique "Beat the GOAT" (Tremor AreaChart) | 🔴 |
| 3 | Table Lead Measures avec saisie inline | 🔴 |
| 4 | Server Actions pour mutations | 🔴 |
| 5 | Calcul auto du statut vert/jaune/rouge | 🟡 |

#### Sprint 3 — Engagements (1 semaine, ~10h)

| # | Feature | Priorité |
|---|---------|----------|
| 1 | Liste engagements avec checkboxes | 🔴 |
| 2 | Ajout rapide d'engagement | 🔴 |
| 3 | Report engagement (Fait/Pas fait) | 🟡 |
| 4 | Historique des engagements | 🟢 |

#### Sprint 4 — Polish MVP (1 semaine, ~10h)

| # | Feature | Priorité |
|---|---------|----------|
| 1 | Mode réunion WIG (flow guidé) | 🟡 |
| 2 | Micro-animations feedback (confetti) | 🟡 |
| 3 | Responsive mobile | 🟡 |
| 4 | Tests manuels + corrections bugs | 🔴 |

### Definition of Done MVP

- [ ] Je peux me connecter avec email/password
- [ ] Je vois tous mes WIGs avec leur statut couleur
- [ ] Je peux créer un nouveau WIG
- [ ] Je peux voir le scoreboard d'un WIG avec graphique
- [ ] Je peux saisir les Lead Measures de la semaine
- [ ] Je peux gérer mes engagements hebdomadaires
- [ ] L'app est déployée sur Vercel et accessible publiquement

### Phase 2 : Multi-Client (4 semaines)

- Système multi-tenant complet (organisations, invitations)
- Portail client (accès limité au scoreboard)
- Exports PDF
- Intégration Google Calendar

### Phase 3 : Intelligence (4 semaines)

- Intégration Claude API pour suggestions de déblocage
- Analytics avancés (patterns de succès/échec)
- Notifications intelligentes + rappels adaptatifs

---

## 9. Prompts Claude Code Suggérés

**Pour démarrer le projet :**
```
Scaffold un projet Next.js 15.5 avec Turbopack pour une app C4DENCE 
de gestion d'exécution 4DX. Configure:
- Supabase Auth avec @supabase/ssr
- Prisma 6 avec le schema fourni
- shadcn/ui + Tremor pour l'UI
- TanStack Query pour le cache client
Crée la structure de dossiers RSC-first.
```

**Pour le dashboard :**
```
Crée un dashboard Server Component qui affiche une grille de WigCards
avec Tremor. Chaque card montre: titre, progression (ProgressBar), 
statut (Badge coloré). Fetch les données avec Prisma direct. 
Ajoute des stats en haut (total, on_track, at_risk, off_track).
```

**Pour le scoreboard :**
```
Crée la page /wig/[id] avec:
1. Server Component qui fetch le WIG + Lead Measures
2. Client Component BeatTheGoat avec Tremor AreaChart (actual vs ideal)
3. Client Component LeadMeasureTable avec saisie inline
4. Server Action updateWeeklyMeasure avec revalidatePath
```

**Pour l'auth :**
```
Configure Supabase Auth avec Next.js 15 App Router:
1. middleware.ts pour protéger les routes
2. lib/supabase/server.ts avec @supabase/ssr
3. Page (auth)/login avec formulaire email/password
4. Callback route pour OAuth
```

---

## 10. Annexes

### A. Glossaire 4DX

| Terme | Définition |
|-------|------------|
| **WIG** | Wildly Important Goal — L'objectif qui compte plus que tout |
| **Lead Measure** | Action prédictive et influençable, mesurée chaque semaine |
| **Lag Measure** | Résultat final (= le WIG lui-même) |
| **Scoreboard** | Tableau de bord visuel montrant si on gagne ou perd |
| **Cadence** | Rythme hebdomadaire de réunions WIG |
| **Whirlwind** | Le tourbillon quotidien (urgences, opérations) |
| **Beat the GOAT** | Visualisation où l'équipe "court contre" la trajectoire idéale |

### B. Références

- McChesney, C., Covey, S., Huling, J. (2021). *The 4 Disciplines of Execution* (2nd Edition)
- FranklinCovey. *4DX Implementation Guide*
- Boulet Stratégies TI. *Framework 4DX Adapté au Rôle de CTO*

### C. Stack Technique — Sources de Validation

- Next.js 15.5 Release Notes (nextjs.org/blog)
- React 19 Documentation (react.dev)
- TanStack Query v5 Comparison (tanstack.com/query)
- Tremor Documentation (tremor.so)
- Prisma vs Drizzle Analysis (bytebase.com/blog)
- Supabase SSR Package (supabase.com/docs)

---

*Document généré le 29 novembre 2025 — Boulet Stratégies TI*
*Version 2.0 — Architecture validée avec best practices novembre 2025*
