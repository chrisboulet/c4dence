# 🚀 PLAN D'IMPLÉMENTATION C4DENCE v3.1

**Date**: Janvier 2025  
**Version**: 3.1 - Ajout du Plancher + Dashboard Orchestration  
**Durée estimée**: 18-25 heures de développement

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture cible](#architecture-cible)
3. [Décisions techniques](#décisions-techniques)
4. [Modèle de données](#modèle-de-données)
5. [Étapes d'implémentation](#étapes-dimplémentation)
6. [Checklist finale](#checklist-finale)

---

## 🎯 VUE D'ENSEMBLE

### Objectifs principaux

1. **Ajouter le niveau "Plancher"** : Gestion du tourbillon opérationnel quotidien
2. **Créer le Dashboard Orchestration** : Vue centrale des 2 niveaux (Plancher + Piliers)
3. **Implémenter la navigation à 3 sections** : Orchestration / Plancher / Piliers
4. **Tracker l'allocation temps** : Ratio Plancher/Piliers avec règle des 10% minimum
5. **Système d'alertes** : Signaux d'alerte automatiques basés sur les métriques

### Principes directeurs

- ✅ **Tracker léger** : Pas de système de ticketing complet, l'utilisateur peut utiliser ses propres outils
- ✅ **Saisie manuelle** : Tracking du temps par l'utilisateur (pas d'automatisation complexe)
- ✅ **Workflow flexible** : Pas de triage forcé, l'utilisateur décide
- ✅ **Desktop first** : Mobile vient après
- ✅ **Migration simple** : Les organisations existantes sont des tests, on peut les supprimer

---

## 🏗️ ARCHITECTURE CIBLE

### Structure de navigation

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] C4DENCE              [🎵 75% | 🎯 25%]    👤 [User] │ ← Header global
└─────────────────────────────────────────────────────────────┘
│
├─ 🎼 ORCHESTRATION (Dashboard central)
│  └─ Vue d'ensemble des 2 niveaux + allocation temps
│
├─ 🎵 LE PLANCHER
│  ├─ Flux (Kanban 4 colonnes)
│  ├─ Triage (Matrice Urgence×Impact)
│  └─ Métriques (Statut + évolution)
│
├─ 🎯 LES 4 PILIERS (existant, ajusté)
│  ├─ Objectifs Prioritaires (renommé de WIG)
│  ├─ Indicateurs Prédictifs (renommé de Lead Measures)
│  ├─ Tableau de Score
│  └─ Synchronisation
│
└─ ⚙️ PARAMÈTRES
   ├─ Organisation
   ├─ Équipe
   └─ Mode de Cadence (A/B/C)
```

### Routes applicatives

```
/dashboard
  /orchestration           → Page d'accueil (vue centrale)
  
  /plancher
    /flux                  → Kanban (par défaut)
    /triage                → Matrice de triage
    /metriques             → Statut et évolution
  
  /piliers
    /objectifs             → Objectifs Prioritaires (ex-WIGs)
    /indicateurs           → Indicateurs Prédictifs (ex-Lead Measures)
    /score                 → Tableau de Score
    /synchronisation       → Réunions hebdo
  
  /settings
    /organization          → Config org
    /team                  → Gestion équipe
    /cadence               → Mode A/B/C
```

---

## 🔧 DÉCISIONS TECHNIQUES

### Stack technique (inchangé)

- **Framework**: Next.js 14+ (App Router)
- **Base de données**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + Shadcn/ui
- **State management**: React Context + Server Components
- **Charts**: Recharts ou Chart.js

### Principes de développement

1. **Composants réutilisables** : Maximiser la réutilisation (cartes, badges, charts)
2. **Server Components par défaut** : Client Components uniquement si interactivité
3. **Progressive enhancement** : Commencer simple, enrichir progressivement
4. **Types stricts** : TypeScript partout, zéro `any`
5. **Accessibilité** : ARIA labels, keyboard navigation

---

## 🗄️ MODÈLE DE DONNÉES

### Nouveaux modèles Prisma

#### 1. Task (Tâche opérationnelle Plancher)

```prisma
model Task {
  id             String       @id @default(uuid())
  title          String
  description    String?
  
  // Triage
  urgency        Urgency?     // HIGH, LOW
  businessImpact BusinessImpact? // HIGH, LOW
  category       TaskCategory? // AUTO-CALCULÉ: IMMEDIATE, PLAN, DELEGATE, BACKLOG
  
  // Flux
  status         TaskStatus   @default(TO_TRIAGE)
  assignedToId   String?
  assignedTo     Profile?     @relation(fields: [assignedToId], references: [id])
  
  // Métadonnées
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime     @default(now())
  completedAt    DateTime?
  
  @@schema("c4dence")
  @@map("tasks")
}

enum Urgency {
  HIGH  // Dans les prochaines heures
  LOW   // Peut attendre quelques jours
  
  @@schema("c4dence")
}

enum BusinessImpact {
  HIGH  // Bloque revenus, clients, employés
  LOW   // Inconvénient, entreprise continue
  
  @@schema("c4dence")
}

enum TaskCategory {
  IMMEDIATE  // Faire maintenant (Haute urgence × Fort impact)
  PLAN       // Planifier cette semaine (Basse urgence × Fort impact)
  DELEGATE   // Déléguer ou refuser (Haute urgence × Faible impact)
  BACKLOG    // Si temps disponible (Basse urgence × Faible impact)
  
  @@schema("c4dence")
}

enum TaskStatus {
  TO_TRIAGE   // À trier
  TODO        // À faire
  IN_PROGRESS // En cours (max 3 par personne)
  DONE        // Terminé
  
  @@schema("c4dence")
}
```

#### 2. TimeAllocation (Allocation temps hebdomadaire)

```prisma
model TimeAllocation {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  weekStartDate  DateTime     // Lundi de la semaine (ISO week)
  
  // Heures par niveau
  floorHours     Float        // Heures Plancher
  pillarsHours   Float        // Heures Piliers
  
  // Calculs automatiques
  totalHours     Float        // = floorHours + pillarsHours
  pillarsPercent Float        // = (pillarsHours / totalHours) * 100
  
  // Validation
  meetsMinimum   Boolean      // = pillarsPercent >= 10
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@unique([organizationId, weekStartDate])
  @@schema("c4dence")
  @@map("time_allocations")
}
```

#### 3. CadenceMode (Mode de cadence choisi)

```prisma
model CadenceMode {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  mode           Mode         @default(MODE_A)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@schema("c4dence")
  @@map("cadence_modes")
}

enum Mode {
  MODE_A  // Réunion unifiée (45 min/semaine) - Petites équipes 1-3
  MODE_B  // Réunions séparées (standard) - Équipes 4-10
  MODE_C  // Daily + Hebdo (intensif) - Grandes équipes 10+ ou crise
  
  @@schema("c4dence")
}
```

### Modifications aux modèles existants

#### Organization

```prisma
model Organization {
  // ... champs existants
  
  // Nouvelles relations
  tasks            Task[]
  timeAllocations  TimeAllocation[]
  cadenceMode      CadenceMode?
}
```

#### Profile

```prisma
model Profile {
  // ... champs existants
  
  // Nouvelles relations
  assignedTasks Task[]
}
```

---

## 📝 ÉTAPES D'IMPLÉMENTATION

### ÉTAPE 1: Mise à jour du schéma Prisma ✅
**Durée estimée**: 30 min

#### Actions
1. [ ] Ajouter les nouveaux modèles dans `prisma/schema.prisma`:
   - `Task` + enums associés
   - `TimeAllocation`
   - `CadenceMode` + enum `Mode`
2. [ ] Ajouter les relations dans `Organization` et `Profile`
3. [ ] Générer la migration: `npx prisma migrate dev --name add_plancher_models`
4. [ ] Générer le client Prisma: `npx prisma generate`
5. [ ] Vérifier que la migration s'applique sans erreur

#### Livrables
- ✅ Migration Prisma appliquée
- ✅ Types TypeScript générés
- ✅ Base de données à jour

---

### ÉTAPE 2: Nouvelle navigation à 3 sections 🎼
**Durée estimée**: 1-2h

#### Actions
1. [ ] Modifier le composant sidebar principal
   - Ajouter section "🎼 Orchestration"
   - Ajouter section "🎵 Le Plancher"
   - Renommer section "🎯 Les 4 Piliers"
2. [ ] Créer la structure de dossiers:
   ```
   app/dashboard/
     orchestration/
       page.tsx
     plancher/
       page.tsx
       flux/
         page.tsx
       triage/
         page.tsx
       metriques/
         page.tsx
     piliers/
       page.tsx (redirect vers /objectifs)
       objectifs/
       indicateurs/
       score/
       synchronisation/
   ```
3. [ ] Ajouter l'indicateur ratio dans le header global:
   - Affichage: `[🎵 75% | 🎯 25%]`
   - Couleur verte si ≥10% Piliers, rouge sinon
   - Tooltip explicatif
4. [ ] Créer le composant `<RatioIndicator />` réutilisable
5. [ ] Mettre à jour les liens de navigation existants

#### Composants clés à créer
- `components/layout/Sidebar.tsx` (modifié)
- `components/layout/Header.tsx` (modifié)
- `components/dashboard/RatioIndicator.tsx` (nouveau)

#### Livrables
- ✅ Navigation restructurée
- ✅ Routes créées
- ✅ Indicateur ratio dans header

---

### ÉTAPE 3: Dashboard Orchestration (page centrale) 🎼
**Durée estimée**: 2-3h

#### Actions
1. [ ] Créer `app/dashboard/orchestration/page.tsx`
2. [ ] Implémenter la mise en page principale:
   - 2 grandes cartes (Plancher + Piliers)
   - Jauge d'allocation temps
   - Section alertes
   - Sélecteur Mode de Cadence
3. [ ] Créer les composants:
   - `<FloorStatusCard />` : Statut du Plancher (🟢/🔴)
   - `<PillarsStatusCard />` : Statut des Piliers (🏆/⚠️)
   - `<TimeAllocationGauge />` : Barre de progression Plancher/Piliers
   - `<AlertsSection />` : Liste des alertes actives
   - `<CadenceModeSelector />` : Choix Mode A/B/C
4. [ ] Créer les Server Actions:
   - `getFloorStatus()` : Calculer statut Plancher
   - `getPillarsStatus()` : Calculer statut Piliers
   - `getCurrentWeekAllocation()` : Récupérer allocation semaine courante
   - `getActiveAlerts()` : Liste des alertes actives
5. [ ] Calculer les métriques basiques:
   - Plancher: 🟢 si backlog stable ET temps stratégique ≥10%, sinon 🔴
   - Piliers: 🏆 si tous les OP sont ON_TRACK, sinon ⚠️

#### Composants à créer
```
components/dashboard/orchestration/
  FloorStatusCard.tsx
  PillarsStatusCard.tsx
  TimeAllocationGauge.tsx
  AlertsSection.tsx
  CadenceModeSelector.tsx
```

#### Server Actions à créer
```
app/actions/orchestration/
  get-floor-status.ts
  get-pillars-status.ts
  get-week-allocation.ts
  get-active-alerts.ts
```

#### Livrables
- ✅ Page Orchestration fonctionnelle
- ✅ Cartes de statut affichées
- ✅ Jauge d'allocation temps
- ✅ Navigation vers Plancher et Piliers

---

### ÉTAPE 4: Le Plancher - Flux (Kanban) 🎵
**Durée estimée**: 3-4h

#### Actions
1. [ ] Créer `app/dashboard/plancher/flux/page.tsx`
2. [ ] Implémenter le système d'onglets (Flux / Triage / Métriques)
3. [ ] Créer le Kanban à 4 colonnes:
   - **À TRIER** : Nouvelles tâches non triées
   - **À FAIRE** : Tâches triées, prêtes à être prises
   - **EN COURS** : Max 3 tâches par personne (WIP limit)
   - **FAIT** : Tâches complétées cette semaine
4. [ ] Implémenter le drag & drop entre colonnes
5. [ ] Créer les composants:
   - `<KanbanBoard />` : Container principal
   - `<KanbanColumn />` : Colonne avec compteur
   - `<TaskCard />` : Carte de tâche
   - `<CreateTaskModal />` : Formulaire création
6. [ ] Créer les Server Actions:
   - `createTask()` : Créer une nouvelle tâche
   - `updateTaskStatus()` : Déplacer une tâche
   - `deleteTask()` : Supprimer une tâche
   - `assignTask()` : Assigner à un membre
7. [ ] Implémenter la validation WIP limit:
   - Bloquer le déplacement vers "EN COURS" si limite atteinte
   - Affichage visuel de la limite (ex: "3/3 ⚠️")

#### Composants à créer
```
components/dashboard/plancher/
  KanbanBoard.tsx
  KanbanColumn.tsx
  TaskCard.tsx
  CreateTaskModal.tsx
  WIPLimitBadge.tsx
```

#### Server Actions à créer
```
app/actions/tasks/
  create-task.ts
  update-task-status.ts
  delete-task.ts
  assign-task.ts
  get-tasks.ts
```

#### Livrables
- ✅ Kanban fonctionnel avec 4 colonnes
- ✅ Drag & drop entre colonnes
- ✅ Limite WIP respectée et affichée
- ✅ CRUD des tâches

---

### ÉTAPE 5: Le Plancher - Triage 🎵
**Durée estimée**: 2-3h

#### Actions
1. [ ] Créer `app/dashboard/plancher/triage/page.tsx`
2. [ ] Implémenter la matrice de triage 2×2:
   - **Axe X** : Impact Business (Faible → Fort)
   - **Axe Y** : Urgence (Basse → Haute)
   - **4 quadrants** :
     - Haute urgence × Fort impact = 🔥 **IMMÉDIAT**
     - Basse urgence × Fort impact = 📅 **PLANIFIER**
     - Haute urgence × Faible impact = 🔄 **DÉLÉGUER**
     - Basse urgence × Faible impact = 📋 **BACKLOG**
3. [ ] Créer le formulaire de triage:
   - Question 1: "Urgence: Dans combien de temps doit-on le faire?" (Haute/Basse)
   - Question 2: "Impact: Que se passe-t-il si on ne le fait pas?" (Fort/Faible)
   - Catégorisation automatique selon les réponses
4. [ ] Afficher la liste "À TRIER" avec actions rapides
5. [ ] Créer les composants:
   - `<TriageMatrix />` : Matrice 2×2 interactive
   - `<TriageForm />` : Formulaire de triage
   - `<UntriageTasksList />` : Liste des tâches à trier
6. [ ] Créer les Server Actions:
   - `triageTask()` : Trier une tâche (set urgency + businessImpact)
   - `getUntriagedTasks()` : Récupérer les tâches non triées

#### Composants à créer
```
components/dashboard/plancher/
  TriageMatrix.tsx
  TriageForm.tsx
  UntriagedTasksList.tsx
  QuadrantCard.tsx
```

#### Server Actions à créer
```
app/actions/tasks/
  triage-task.ts
  get-untriaged-tasks.ts
```

#### Logique de catégorisation automatique

```typescript
function autoCategorizeTas(urgency: Urgency, businessImpact: BusinessImpact): TaskCategory {
  if (urgency === 'HIGH' && businessImpact === 'HIGH') return 'IMMEDIATE';
  if (urgency === 'LOW' && businessImpact === 'HIGH') return 'PLAN';
  if (urgency === 'HIGH' && businessImpact === 'LOW') return 'DELEGATE';
  if (urgency === 'LOW' && businessImpact === 'LOW') return 'BACKLOG';
}
```

#### Livrables
- ✅ Matrice de triage fonctionnelle
- ✅ Formulaire de triage
- ✅ Auto-catégorisation des tâches
- ✅ Liste des tâches à trier

---

### ÉTAPE 6: Le Plancher - Métriques 🎵
**Durée estimée**: 2h

#### Actions
1. [ ] Créer `app/dashboard/plancher/metriques/page.tsx`
2. [ ] Calculer et afficher le **statut Plancher**:
   - 🟢 **SOUS CONTRÔLE** si:
     - Backlog stable ou en baisse
     - Temps stratégique ≥ 10%
   - 🔴 **DÉBORDEMENT** sinon
3. [ ] Afficher les métriques clés:
   - Taille du backlog actuel
   - Évolution du backlog (↗️ +2 / ↘️ -3)
   - Limite WIP respectée (✅/❌)
   - % temps stratégique cette semaine
4. [ ] Créer les charts d'évolution (4 dernières semaines):
   - Chart 1: Taille du backlog
   - Chart 2: % temps stratégique
   - Chart 3: Nombre de tâches complétées/semaine
5. [ ] Créer les composants:
   - `<FloorStatusBadge />` : Badge 🟢/🔴
   - `<MetricsCards />` : Cartes des métriques clés
   - `<BacklogTrendChart />` : Chart évolution backlog
   - `<StrategicTimeChart />` : Chart % temps stratégique
6. [ ] Créer les Server Actions:
   - `calculateFloorStatus()` : Calcul du statut
   - `getBacklogTrend()` : Évolution du backlog
   - `getWeeklyMetrics()` : Métriques des 4 dernières semaines

#### Composants à créer
```
components/dashboard/plancher/
  FloorStatusBadge.tsx
  MetricsCards.tsx
  BacklogTrendChart.tsx
  StrategicTimeChart.tsx
```

#### Server Actions à créer
```
app/actions/plancher/
  calculate-floor-status.ts
  get-backlog-trend.ts
  get-weekly-metrics.ts
```

#### Logique de calcul du statut Plancher

```typescript
function calculateFloorStatus(
  backlogTrend: 'growing' | 'stable' | 'shrinking',
  strategicTimePercent: number
): 'CONTROLLED' | 'OVERFLOWING' {
  const backlogOk = backlogTrend === 'stable' || backlogTrend === 'shrinking';
  const timeOk = strategicTimePercent >= 10;
  
  return (backlogOk && timeOk) ? 'CONTROLLED' : 'OVERFLOWING';
}
```

#### Livrables
- ✅ Statut Plancher calculé et affiché
- ✅ Métriques clés visibles
- ✅ Charts d'évolution fonctionnels

---

### ÉTAPE 7: Saisie manuelle allocation temps ⏱️
**Durée estimée**: 1-2h

#### Actions
1. [ ] Créer le composant `<TimeTrackerModal />`:
   - Formulaire simple: "Cette semaine (du X au Y):"
   - Input: "Heures passées sur le Plancher (opérationnel)"
   - Input: "Heures passées sur les Piliers (stratégique)"
   - Calcul automatique du total et du %
   - Validation: Afficher warning si Piliers < 10%
2. [ ] Ajouter un bouton "⏱️ Enregistrer le temps" dans le header
3. [ ] Afficher l'allocation actuelle dans le dashboard Orchestration
4. [ ] Créer une page d'historique: `app/dashboard/plancher/temps/page.tsx`
   - Tableau des 12 dernières semaines
   - Colonnes: Semaine | Plancher | Piliers | % Piliers | Statut
5. [ ] Créer les Server Actions:
   - `saveTimeAllocation()` : Enregistrer l'allocation
   - `getWeekAllocation()` : Récupérer l'allocation d'une semaine
   - `getAllocationsHistory()` : Historique des 12 dernières semaines
6. [ ] Ajouter une notification si aucune allocation n'est enregistrée cette semaine

#### Composants à créer
```
components/dashboard/
  TimeTrackerModal.tsx
  TimeAllocationHistory.tsx
```

#### Server Actions à créer
```
app/actions/time/
  save-time-allocation.ts
  get-week-allocation.ts
  get-allocations-history.ts
```

#### Livrables
- ✅ Modal de saisie du temps
- ✅ Validation règle des 10%
- ✅ Affichage dans Orchestration
- ✅ Historique des 12 semaines

---

### ÉTAPE 8: Signaux d'alerte ⚠️
**Durée estimée**: 2h

#### Actions
1. [ ] Implémenter la détection des **signaux d'alerte Plancher**:
   - ⚠️ Backlog qui double en 2 semaines
   - ⚠️ Même tâche "en cours" depuis 3+ semaines
   - ⚠️ Limite WIP constamment violée
   - 🔴 Temps stratégique < 5% (débordement critique)
2. [ ] Implémenter la détection des **signaux d'alerte Piliers**:
   - ⚠️ OP en statut DANGER pendant 3+ semaines
   - ⚠️ IP en baisse 4 semaines consécutives
   - ⚠️ Engagements tenus < 50%
   - 🔴 Réunions annulées 2+ fois
3. [ ] Créer le composant `<AlertCard />`:
   - Icône selon gravité (⚠️ Warning / 🔴 Critical)
   - Message clair
   - Action suggérée
   - Lien vers la section concernée
4. [ ] Afficher les alertes dans:
   - Dashboard Orchestration (toutes les alertes actives)
   - Plancher > Métriques (alertes Plancher)
   - Piliers > Score (alertes Piliers)
5. [ ] Créer les Server Actions:
   - `detectFloorAlerts()` : Détection alertes Plancher
   - `detectPillarsAlerts()` : Détection alertes Piliers
   - `dismissAlert()` : Marquer une alerte comme vue

#### Composants à créer
```
components/dashboard/alerts/
  AlertCard.tsx
  AlertsList.tsx
  AlertBadge.tsx
```

#### Server Actions à créer
```
app/actions/alerts/
  detect-floor-alerts.ts
  detect-pillars-alerts.ts
  get-active-alerts.ts
  dismiss-alert.ts
```

#### Logique de détection des alertes

```typescript
interface Alert {
  id: string;
  type: 'warning' | 'critical';
  source: 'floor' | 'pillars';
  title: string;
  message: string;
  action: string;
  link: string;
}

// Exemple: Backlog qui double
function detectBacklogAlert(current: number, twoWeeksAgo: number): Alert | null {
  if (current >= twoWeeksAgo * 2) {
    return {
      type: 'warning',
      source: 'floor',
      title: 'Backlog en explosion',
      message: `Le backlog a doublé en 2 semaines (${twoWeeksAgo} → ${current} tâches)`,
      action: 'Évaluer charge vs ressources',
      link: '/dashboard/plancher/metriques'
    };
  }
  return null;
}
```

#### Livrables
- ✅ Système de détection des alertes
- ✅ Affichage dans Orchestration
- ✅ Liens vers les sections concernées

---

### ÉTAPE 9: Modes de Cadence 📅
**Durée estimée**: 1-2h

#### Actions
1. [ ] Créer la page de configuration: `app/dashboard/settings/cadence/page.tsx`
2. [ ] Implémenter le sélecteur de mode:
   - **Mode A** : Réunion unifiée (45 min/semaine)
     - Pour: Petites organisations, équipe TI de 1-3 personnes
     - Une seule réunion : Plancher (15 min) + Piliers (30 min)
   - **Mode B** : Réunions séparées (standard)
     - Pour: Organisations standards, équipes 4-10
     - Deux réunions : Plancher (20-30 min) + Piliers (30 min)
   - **Mode C** : Daily + Hebdo (intensif)
     - Pour: Grandes organisations 10+ ou situations de crise
     - Daily Plancher (10-15 min) + Réunion Piliers hebdo (30 min)
3. [ ] Afficher le mode actif dans le dashboard Orchestration
4. [ ] Adapter la page Synchronisation selon le mode:
   - Mode A: Afficher un template "Réunion Unifiée"
   - Mode B: Afficher deux templates séparés
   - Mode C: Afficher le template Daily + Hebdo
5. [ ] Créer les composants:
   - `<CadenceModeSelector />` : Sélection du mode
   - `<ModeDescription />` : Description de chaque mode
   - `<SyncTemplateA/B/C />` : Templates de réunions
6. [ ] Créer les Server Actions:
   - `setCadenceMode()` : Définir le mode
   - `getCadenceMode()` : Récupérer le mode actuel

#### Composants à créer
```
components/dashboard/settings/
  CadenceModeSelector.tsx
  ModeDescription.tsx
components/dashboard/sync/
  SyncTemplateUnified.tsx
  SyncTemplateSeparate.tsx
  SyncTemplateDaily.tsx
```

#### Server Actions à créer
```
app/actions/settings/
  set-cadence-mode.ts
  get-cadence-mode.ts
```

#### Livrables
- ✅ Configuration du Mode de Cadence
- ✅ Affichage du mode actif
- ✅ Adaptation des templates de réunions

---

### ÉTAPE 10: Ajustements terminologie Piliers 📝
**Durée estimée**: 1h

#### Actions
1. [ ] Renommer globalement dans le code:
   - "WIG" → "Objectif Prioritaire (OP)"
   - "Wildly Important Goal" → "Objectif Prioritaire"
   - "Lead Measure" → "Indicateur Prédictif (IP)"
   - "Lag Measure" → "Indicateur de Résultat (IR)"
2. [ ] Renforcer les limites dans l'UI:
   - Max 2-3 Objectifs Prioritaires par organisation
   - Max 2-3 Indicateurs Prédictifs par OP
   - Afficher un warning si dépassement
   - Bloquer la création au-delà de la limite
3. [ ] Ajuster les textes d'aide / tooltips:
   - Expliquer ce qu'est un OP (référence manuel v3.1)
   - Expliquer la différence IP vs IR
   - Exemples concrets québécois
4. [ ] Mettre à jour les types TypeScript:
   ```typescript
   // Avant
   type WIG = {...}
   
   // Après
   type ObjectifPrioritaire = {...}
   type OP = ObjectifPrioritaire; // Alias court
   ```
5. [ ] Mettre à jour les noms de fichiers:
   ```
   wigs/ → objectifs/
   lead-measures/ → indicateurs/
   ```

#### Fichiers à modifier
- `app/dashboard/piliers/**/*.tsx`
- `components/dashboard/piliers/**/*.tsx`
- `app/actions/piliers/**/*.ts`
- `lib/types/**/*.ts`

#### Livrables
- ✅ Terminologie harmonisée avec manuel v3.1
- ✅ Limites 2-3 OP/IP renforcées
- ✅ Tooltips et aide contextuelle

---

### ÉTAPE 11: Intégration finale 🔗
**Durée estimée**: 1-2h

#### Actions
1. [ ] Vérifier la cohérence des liens de navigation:
   - Dashboard Orchestration → Plancher/Piliers
   - Plancher → Orchestration
   - Piliers → Orchestration
   - Alertes → Sections concernées
2. [ ] Implémenter les breadcrumbs cohérents:
   ```
   Orchestration
   Orchestration > Le Plancher > Flux
   Orchestration > Les Piliers > Objectifs
   ```
3. [ ] Partager l'état du ratio temps dans toute l'app:
   - Header global: `[🎵 75% | 🎯 25%]`
   - Mise à jour temps réel après saisie
   - Changement de couleur si < 10%
4. [ ] Tests de bout en bout:
   - Créer une tâche → Triage → Kanban → Complétion
   - Créer un OP → Ajouter des IP → Voir dans Orchestration
   - Saisir allocation temps → Voir mise à jour du ratio
   - Déclencher une alerte → Voir apparaître dans Orchestration
5. [ ] Ajustements visuels/UX:
   - Espacements cohérents
   - Couleurs harmonisées
   - Animations subtiles
   - Loading states
   - Error states

#### Tests à effectuer
```
✓ Création d'une organisation
✓ Ajout de membres d'équipe
✓ Création d'une tâche Plancher
✓ Triage d'une tâche
✓ Déplacement dans le Kanban
✓ Respect de la limite WIP
✓ Saisie allocation temps
✓ Validation règle 10%
✓ Création d'un OP
✓ Ajout d'IP à un OP
✓ Saisie des scores hebdo
✓ Génération des alertes
✓ Navigation complète
✓ Responsive (desktop)
```

#### Livrables
- ✅ Navigation fluide
- ✅ États partagés cohérents
- ✅ Tests de bout en bout validés
- ✅ UX polie

---

### ÉTAPE 12: Documentation utilisateur 📖
**Durée estimée**: 1h

#### Actions
1. [ ] Ajouter des tooltips contextuels partout:
   - Icônes "?" à côté des termes importants
   - Hover pour afficher l'explication
   - Exemples concrets
2. [ ] Créer une page d'aide intégrée: `app/dashboard/aide/page.tsx`
   - Section 1: C'est quoi C4DENCE?
   - Section 2: Le Plancher (Triage, Flux, Limites)
   - Section 3: Les 4 Piliers (OP, IP, Score, Sync)
   - Section 4: Dashboard Orchestration
   - Section 5: Modes de Cadence
   - Section 6: Signaux d'alerte
3. [ ] Implémenter un onboarding pour nouveaux utilisateurs:
   - Popup au premier login
   - Tour guidé des 3 sections
   - "Commencer" → Créer première tâche
   - "Suivant" → Créer premier OP
   - "Terminer" → Voir le dashboard Orchestration
4. [ ] Ajouter un lien vers le manuel C4DENCE v3.1:
   - Dans le menu d'aide
   - Dans le footer
   - Ouvrir dans un nouvel onglet
5. [ ] Créer des vidéos/GIFs explicatifs (optionnel):
   - Comment trier une tâche
   - Comment utiliser le Kanban
   - Comment saisir l'allocation temps

#### Composants à créer
```
components/dashboard/help/
  Tooltip.tsx
  HelpSection.tsx
  OnboardingModal.tsx
  GuidedTour.tsx
```

#### Livrables
- ✅ Tooltips contextuels
- ✅ Page d'aide complète
- ✅ Onboarding pour nouveaux utilisateurs
- ✅ Lien vers manuel v3.1

---

## ✅ CHECKLIST FINALE

### Fonctionnalités Plancher
- [ ] Tâches opérationnelles créées
- [ ] Matrice de triage fonctionnelle
- [ ] Auto-catégorisation Immédiat/Planifier/Déléguer/Backlog
- [ ] Kanban 4 colonnes avec drag & drop
- [ ] Limite WIP de 3 tâches "En cours" respectée
- [ ] Statut Plancher calculé (🟢 Sous contrôle / 🔴 Débordement)
- [ ] Métriques Plancher affichées (backlog, WIP, temps stratégique)
- [ ] Charts d'évolution (4 dernières semaines)

### Dashboard Orchestration
- [ ] Vue centrale des 2 niveaux (Plancher + Piliers)
- [ ] Cartes de statut (🟢/🔴 et 🏆/⚠️)
- [ ] Jauge d'allocation temps (🎵 % | 🎯 %)
- [ ] Section alertes actives
- [ ] Sélecteur Mode de Cadence (A/B/C)
- [ ] Navigation vers Plancher et Piliers

### Allocation Temps
- [ ] Saisie manuelle hebdomadaire (Plancher + Piliers)
- [ ] Calcul automatique du ratio et du %
- [ ] Validation règle des 10% minimum
- [ ] Affichage du ratio dans le header global
- [ ] Historique des 12 dernières semaines
- [ ] Changement de couleur si < 10%

### Signaux d'Alerte
- [ ] Détection alertes Plancher (4 signaux)
- [ ] Détection alertes Piliers (4 signaux)
- [ ] Affichage dans Orchestration
- [ ] Affichage dans sections concernées
- [ ] Liens vers actions suggérées
- [ ] Badges/notifications visuels

### Modes de Cadence
- [ ] Sélection Mode A/B/C dans settings
- [ ] Affichage du mode actif dans Orchestration
- [ ] Adaptation des templates de réunions
- [ ] Documentation de chaque mode

### Ajustements Piliers
- [ ] Renommage WIG → Objectif Prioritaire (OP)
- [ ] Renommage Lead Measure → Indicateur Prédictif (IP)
- [ ] Limite max 2-3 OP par organisation
- [ ] Limite max 2-3 IP par OP
- [ ] Warnings visuels si dépassement
- [ ] Tooltips avec exemples québécois

### Navigation & UX
- [ ] Sidebar avec 3 sections (Orchestration/Plancher/Piliers)
- [ ] Routes créées et fonctionnelles
- [ ] Breadcrumbs cohérents
- [ ] Indicateur ratio dans header
- [ ] Liens de navigation fluides
- [ ] Loading states
- [ ] Error states
- [ ] Responsive desktop

### Documentation
- [ ] Tooltips contextuels partout
- [ ] Page d'aide intégrée
- [ ] Onboarding nouveaux utilisateurs
- [ ] Lien vers manuel C4DENCE v3.1

### Tests & Qualité
- [ ] Tests de bout en bout validés
- [ ] Aucune régression sur les Piliers existants
- [ ] Performance acceptable (< 2s load time)
- [ ] Accessibilité (ARIA labels, keyboard nav)
- [ ] Types TypeScript stricts (zéro `any`)

---

## 📊 RÉSUMÉ

### Durée totale estimée
**18-25 heures de développement**

### Ordre de priorité
1. ✅ **Foundation** (Étapes 1-2) : Schéma + Navigation
2. 🎼 **Orchestration** (Étape 3) : Dashboard central
3. 🎵 **Le Plancher** (Étapes 4-6) : Cœur de la nouveauté
4. ⏱️ **Allocation Temps** (Étape 7) : Tracking manuel
5. ⚠️ **Alertes** (Étape 8) : Intelligence
6. 🔗 **Intégration** (Étapes 9-11) : Harmonisation
7. 📖 **Documentation** (Étape 12) : Aide utilisateur

### Points d'attention
- **Simplicité d'abord** : Tracker léger, pas de sur-ingénierie
- **Workflow flexible** : Pas de triage forcé, laisser l'utilisateur décider
- **Desktop first** : Mobile vient après
- **Performance** : Optimiser les requêtes DB (indexes, caching)
- **Accessibilité** : ARIA labels, keyboard navigation
- **Tests** : Valider chaque étape avant de passer à la suivante

---

## 🚀 PRÊT À DÉMARRER

Le plan est complet et séquentiel. On commence par **ÉTAPE 1 + ÉTAPE 2**:
1. Mise à jour du schéma Prisma
2. Nouvelle navigation à 3 sections

Ces deux étapes posent les fondations solides pour tout le reste.

**C'est parti! 🎵🎯**
