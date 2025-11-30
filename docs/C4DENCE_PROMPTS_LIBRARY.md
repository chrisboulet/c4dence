# 🎯 C4DENCE — Bibliothèque de Prompts Claude Code

**Version** : 1.0  
**Date** : 30 novembre 2025  
**Usage** : Prompts testés et optimisés pour chaque phase de développement

---

## 📋 Table des Matières

1. [Contexte Initial](#1-contexte-initial)
2. [Sprint 0 — Setup](#2-sprint-0--setup)
3. [Sprint 1 — Dashboard](#3-sprint-1--dashboard)
4. [Sprint 2 — Scoreboard WIG](#4-sprint-2--scoreboard-wig)
5. [Sprint 3 — Cadence](#5-sprint-3--cadence)
6. [Sprint 4 — Polish](#6-sprint-4--polish)
7. [Prompts Utilitaires](#7-prompts-utilitaires)
8. [Prompts de Debug](#8-prompts-de-debug)

---

## 1. Contexte Initial

**À fournir à Claude Code au début de CHAQUE session :**

```
Tu travailles sur C4DENCE, une application Next.js 15.5 de gestion d'exécution stratégique basée sur la méthodologie 4DX.

DOCUMENTS DE RÉFÉRENCE (lis-les avant de coder) :
- C4DENCE_CONVENTIONS.md : Standards de code obligatoires
- C4DENCE_COMPONENTS.md : Catalogue des composants UI
- prisma/schema.prisma : Modèle de données

STACK :
- Next.js 15.5 (App Router, Turbopack, Server Components par défaut)
- React 19
- Prisma 6 avec schema "c4dence" (pas public)
- Supabase Auth (@supabase/ssr) avec Google OAuth
- TanStack Query 5 (cache client uniquement)
- shadcn/ui + Tremor (charts)
- TypeScript strict

PATTERNS OBLIGATOIRES :
- Server Components par défaut (pas de 'use client' sauf interactivité)
- Server Actions pour les mutations (pas d'API Routes)
- Validation Zod sur toutes les entrées
- Type ActionResult<T> pour les retours d'actions
- Français pour l'UI, anglais pour le code

Tu es dans le répertoire /home/user/c4dence
```

---

## 2. Sprint 0 — Setup

### 2.1 Création du projet

```
Crée le projet Next.js 15.5 C4DENCE avec cette structure :

1. Initialise avec :
   npx create-next-app@latest c4dence --typescript --tailwind --eslint --app --src-dir --turbopack

2. Installe les dépendances :
   - @supabase/supabase-js @supabase/ssr
   - @prisma/client prisma
   - @tanstack/react-query
   - @tremor/react
   - lucide-react date-fns zod react-hook-form @hookform/resolvers

3. Configure shadcn/ui :
   npx shadcn@latest init (style: default, base color: slate, css variables: yes)
   
4. Ajoute les composants shadcn requis :
   button card input label dialog dropdown-menu tabs badge progress skeleton avatar separator tooltip textarea select popover calendar

5. Crée la structure de dossiers selon C4DENCE_COMPONENTS.md

6. Configure tailwind.config.ts pour Tremor

Ne génère pas encore de code métier, juste le setup.
```

### 2.2 Configuration Prisma

```
Configure Prisma pour C4DENCE avec le schema "c4dence" :

1. Copie le fichier prisma/schema.prisma fourni

2. Crée prisma/.env.example avec les variables requises :
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

3. Crée lib/prisma.ts avec le singleton pattern :
   - Import PrismaClient
   - Gestion du hot reload en dev
   - Export de l'instance

4. Ne fais PAS encore prisma migrate — on fera ça manuellement sur Supabase
```

### 2.3 Configuration Supabase Auth

```
Configure Supabase Auth avec @supabase/ssr pour C4DENCE :

1. Crée lib/supabase/server.ts :
   - Fonction createServerClient() qui utilise cookies()
   - Pour Server Components et Server Actions

2. Crée lib/supabase/client.ts :
   - Fonction createBrowserClient()
   - Pour Client Components

3. Crée middleware.ts à la racine :
   - Refresh le token si expiré
   - Protège les routes (dashboard)/* 
   - Redirige vers /login si non authentifié
   - Laisse passer /login, /auth/callback

4. Crée app/(auth)/login/page.tsx :
   - Bouton "Se connecter avec Google"
   - Utilise supabase.auth.signInWithOAuth

5. Crée app/(auth)/auth/callback/route.ts :
   - Gère le callback OAuth
   - Échange le code contre une session

Réfère-toi aux conventions pour le style de code.
```

### 2.4 Configuration TanStack Query

```
Configure TanStack Query pour C4DENCE :

1. Crée lib/query-client.ts :
   - Configuration du QueryClient
   - Options par défaut (staleTime, retry, etc.)

2. Crée components/providers/query-provider.tsx :
   - 'use client'
   - QueryClientProvider wrapper
   - ReactQueryDevtools en dev

3. Modifie app/layout.tsx :
   - Wrap children avec QueryProvider

4. Crée un hook exemple hooks/use-wig.ts :
   - useQuery pour fetch un WIG
   - useMutation pour update
   - Pattern d'invalidation du cache
```

---

## 3. Sprint 1 — Dashboard

### 3.1 Layout principal

```
Crée le layout principal de C4DENCE :

1. Crée app/(dashboard)/layout.tsx (Server Component) :
   - Fetch l'utilisateur et ses organisations via Prisma
   - Redirige si pas d'organisation
   - Passe les données au client layout

2. Crée components/layout/app-shell.tsx :
   - Structure sidebar + contenu
   - Responsive : sidebar collapsible sur mobile
   - Utilise CSS Grid ou Flexbox

3. Crée components/layout/sidebar.tsx ('use client') :
   - Logo C4DENCE en haut
   - Sélecteur d'organisation (si plusieurs)
   - Navigation : Dashboard, Objectifs, Cadence, Équipe, Paramètres
   - Profil utilisateur en bas avec menu déconnexion

4. Crée components/layout/nav-link.tsx :
   - Utilise usePathname() pour état actif
   - Props : href, icon, label, badge

Suis le catalogue COMPONENTS.md pour les props et styles.
```

### 3.2 Page Dashboard

```
Crée la page Dashboard de C4DENCE :

1. Crée app/(dashboard)/page.tsx (Server Component) :
   - Fetch les WIGs de l'organisation courante avec leurs lead measures
   - Calcule les stats : total WIGs, on track, at risk, off track
   - Fetch les engagements de la semaine courante

2. Crée les composants :

   a) components/cards/kpi-card.tsx :
      - Utilise Tremor Card, Metric, Text, BadgeDelta
      - Props selon COMPONENTS.md

   b) components/cards/wig-card.tsx :
      - StatusBadge, nom, progression, ProgressBar, échéance
      - Bordure colorée selon statut
      - onClick pour navigation

   c) components/shared/status-badge.tsx :
      - Mapping WigStatus → couleur + label FR

3. Layout de la page :
   - PageHeader : "Tableau de bord" + bouton "Nouveau WIG"
   - 4 KPI cards en row (Total, On Track, At Risk, Off Track)
   - Grid de WigCards (responsive : 1 col mobile, 2 tablet, 3 desktop)
   - Section "Engagements de la semaine" si pertinent

4. Crée app/(dashboard)/loading.tsx avec Skeletons

Utilise Tremor pour les KPI cards, shadcn pour le reste.
```

### 3.3 Création de WIG

```
Crée le flow de création d'un WIG :

1. Crée components/forms/wig-form.tsx ('use client') :
   - react-hook-form + zod resolver
   - Champs : name, description, startValue, targetValue, unit, startDate, endDate
   - Validation : targetValue > startValue, endDate > startDate
   - Props : onSubmit, onCancel, isLoading, wig? (mode édition)

2. Crée lib/validations/wig.ts :
   - CreateWigSchema avec Zod
   - UpdateWigSchema (partial + id requis)

3. Crée app/(dashboard)/wig/new/page.tsx :
   - Dialog ou page complète ? → Page complète pour MVP
   - WigForm avec Server Action

4. Crée app/(dashboard)/wig/new/actions.ts :
   - 'use server'
   - createWigAction(formData: FormData): Promise<ActionResult<{ id: string }>>
   - Validation, auth check, Prisma create
   - revalidatePath('/') après création

5. Ajoute le bouton "Nouveau WIG" dans le dashboard qui navigue vers /wig/new

Pattern : Server Action appelée depuis Client Component via form action ou mutation.
```

---

## 4. Sprint 2 — Scoreboard WIG

### 4.1 Page détail WIG

```
Crée la page détail d'un WIG (Scoreboard) :

1. Crée app/(dashboard)/wig/[id]/page.tsx (Server Component) :
   - Fetch le WIG avec ses lead measures et weekly measures
   - Vérifie que l'utilisateur a accès (membership)
   - 404 si non trouvé

2. Layout de la page :
   - PageHeader avec nom du WIG + StatusBadge + bouton éditer
   - Section "Progression" :
     - BeatTheGoat chart (progression vs cible)
     - KPIs : Valeur actuelle, Cible, Jours restants
   - Section "Mesures prédictives" :
     - LeadMeasuresTable avec saisie inline
   - Section "Ajouter une mesure" (bouton)

3. Crée components/charts/beat-the-goat.tsx :
   - Tremor AreaChart
   - Deux séries : "Réel" (bleu) et "Cible" (gris pointillé)
   - Données : progression semaine par semaine

4. Crée lib/wig-status.ts :
   - calculateWigStatus(wig): WigStatus
   - calculateProgressData(wig): ProgressDataPoint[]
   - Logique de calcul documentée
```

### 4.2 Table des Lead Measures

```
Crée la table des mesures prédictives avec saisie inline :

1. Crée components/tables/lead-measures-table.tsx ('use client') :
   - Colonnes : Nom, Cible/sem, S-3, S-2, S-1, Cette sem, Tendance, Actions
   - Les 4 dernières semaines sont des WeeklyInput éditables
   - TrendBadge pour la tendance

2. Crée components/forms/weekly-input.tsx ('use client') :
   - Input numérique compact
   - Sauvegarde sur blur ou Enter
   - Couleur de fond : vert si >= cible, rouge si < cible
   - Loading spinner pendant sauvegarde
   - Utilise useMutation de TanStack Query

3. Crée app/(dashboard)/wig/[id]/actions.ts :
   - updateWeeklyMeasureAction(formData): Promise<ActionResult>
   - Validation, auth, upsert Prisma
   - revalidatePath après update

4. Crée components/charts/trend-badge.tsx :
   - Calcule le delta entre semaine courante et précédente
   - Tremor BadgeDelta avec flèche

Assure-toi que la table est responsive (scroll horizontal sur mobile).
```

### 4.3 Création Lead Measure

```
Crée le flow d'ajout d'une mesure prédictive :

1. Crée components/forms/lead-measure-form.tsx ('use client') :
   - Champs : name, description, targetPerWeek, unit
   - Dans un Dialog (pas une page séparée)
   - Validation Zod

2. Crée lib/validations/lead-measure.ts :
   - CreateLeadMeasureSchema
   - targetPerWeek > 0

3. Ajoute le Server Action dans app/(dashboard)/wig/[id]/actions.ts :
   - createLeadMeasureAction(formData): Promise<ActionResult<{ id: string }>>

4. Intègre le Dialog dans la page WIG :
   - Bouton "Ajouter une mesure prédictive"
   - Dialog avec LeadMeasureForm
   - Ferme et refresh après succès

Maximum 3 lead measures par WIG — affiche un message si limite atteinte.
```

---

## 5. Sprint 3 — Cadence

### 5.1 Page Réunion de Cadence

```
Crée la page de réunion de cadence hebdomadaire :

1. Crée app/(dashboard)/cadence/page.tsx (Server Component) :
   - Fetch : WIGs actifs, engagements semaine passée, engagements semaine courante
   - Détermine la semaine courante (ISO 8601)

2. Layout de la page :
   - PageHeader : "Réunion de Cadence" + WeekSelector
   - Section "Revue des engagements" (semaine passée) :
     - EngagementsTable avec boutons Complété/Manqué
   - Section "Scoreboards" :
     - Résumé de chaque WIG (mini-card cliquable)
   - Section "Nouveaux engagements" :
     - Liste des engagements de la semaine + formulaire d'ajout

3. Crée components/shared/week-selector.tsx ('use client') :
   - Affiche "Semaine 48, 2025"
   - Boutons < > pour naviguer
   - Bouton "Cette semaine" pour reset
   - Gère le changement via URL searchParams ou state
```

### 5.2 Gestion des Engagements

```
Crée la gestion complète des engagements :

1. Crée components/cards/engagement-card.tsx ('use client') :
   - Avatar + nom du membre
   - Description de l'engagement
   - StatusBadge
   - Boutons Complété/Manqué si PENDING et propriétaire
   - Champ notes de suivi si COMPLETED/MISSED

2. Crée components/forms/engagement-form.tsx ('use client') :
   - Textarea "Je m'engage à..."
   - Soumission Ctrl+Enter ou bouton
   - Max 500 caractères

3. Crée components/tables/engagements-table.tsx :
   - Groupé par statut
   - Colonnes : Membre, Engagement, Statut, Actions

4. Crée app/(dashboard)/cadence/actions.ts :
   - createEngagementAction(formData): Promise<ActionResult>
   - updateEngagementStatusAction(id, status, notes?): Promise<ActionResult>

5. Logique métier :
   - Un membre peut créer max 2 engagements par semaine
   - Seul le propriétaire peut changer le statut de son engagement
   - Les engagements PENDING de la semaine passée deviennent MISSED automatiquement
```

### 5.3 Résumé de Cadence

```
Crée le composant de résumé pour la réunion :

1. Crée components/cards/cadence-summary-card.tsx :
   - Résumé des engagements : X/Y complétés, taux %
   - Résumé des WIGs : X on track, Y at risk, Z off track
   - Top 3 mesures prédictives les plus/moins performantes

2. Ajoute une section "Résumé" en haut de la page cadence :
   - 3 KPI cards : Engagements complétés, WIGs on track, Meilleure mesure

3. Crée lib/cadence-stats.ts :
   - calculateEngagementStats(engagements): EngagementSummary
   - calculateWeekPerformance(wigs): { best: LeadMeasure, worst: LeadMeasure }
```

---

## 6. Sprint 4 — Polish

### 6.1 Page Équipe

```
Crée la page de gestion d'équipe :

1. Crée app/(dashboard)/team/page.tsx :
   - Liste des membres de l'organisation
   - Bouton "Inviter un membre" (OWNER/ADMIN only)

2. Crée components/tables/members-table.tsx :
   - Colonnes : Avatar, Nom, Email, Rôle, Actions
   - Actions : Changer rôle, Retirer (selon permissions)

3. Crée components/forms/invite-member-form.tsx :
   - Input email
   - Select rôle (ADMIN ou MEMBER)
   - Note : Pour MVP, on crée juste le membership
     L'utilisateur doit déjà avoir un compte

4. Server Actions dans app/(dashboard)/team/actions.ts :
   - inviteMemberAction(email, role)
   - updateMemberRoleAction(membershipId, role)
   - removeMemberAction(membershipId)
```

### 6.2 Page Paramètres

```
Crée la page de paramètres :

1. Crée app/(dashboard)/settings/page.tsx avec Tabs :
   - Tab "Organisation" : nom, jour de cadence, heure
   - Tab "Profil" : nom, avatar, timezone
   - Tab "Notifications" : (placeholder pour futur)

2. Crée components/forms/organization-form.tsx :
   - Champs : name, cadenceDay (select), cadenceTime (input time)
   - OWNER/ADMIN only

3. Crée components/forms/profile-form.tsx :
   - Champs : fullName, timezone (select)
   - Avatar : affichage seulement (vient de Google)

4. Server Actions dans app/(dashboard)/settings/actions.ts :
   - updateOrganizationAction(formData)
   - updateProfileAction(formData)
```

### 6.3 États vides et erreurs

```
Ajoute les états vides et gestion d'erreurs partout :

1. Crée components/shared/empty-state.tsx :
   - Props : icon, title, description, action?
   - Design centré, illustration optionnelle

2. Ajoute EmptyState dans :
   - Dashboard sans WIGs : "Créez votre premier objectif ambitieux"
   - WIG sans lead measures : "Ajoutez des mesures prédictives"
   - Cadence sans engagements : "Prenez votre premier engagement"
   - Équipe avec 1 seul membre : "Invitez votre équipe"

3. Crée app/(dashboard)/error.tsx :
   - Error boundary global
   - Bouton "Réessayer"
   - Lien vers support si erreur persiste

4. Crée app/(dashboard)/not-found.tsx :
   - Message "Page non trouvée"
   - Lien retour au dashboard
```

---

## 7. Prompts Utilitaires

### 7.1 Ajouter un nouveau composant

```
Crée le composant [NOM] pour C4DENCE :

Réfère-toi à :
- C4DENCE_COMPONENTS.md pour les specs
- C4DENCE_CONVENTIONS.md pour le style de code

Le composant doit :
- Être dans le bon dossier (components/[category]/)
- Avoir des props typées avec interface
- Suivre les patterns RSC (Server par défaut, 'use client' si interactivité)
- Utiliser les composants UI existants (shadcn, Tremor)
- Avoir des labels en français

Après création, dis-moi si je dois mettre à jour le catalogue COMPONENTS.md.
```

### 7.2 Créer un Server Action

```
Crée un Server Action pour [DESCRIPTION] :

Fichier : app/(dashboard)/[path]/actions.ts

Le Server Action doit :
1. Avoir la directive 'use server' en haut du fichier
2. Valider les inputs avec Zod
3. Vérifier l'authentification via Supabase
4. Vérifier les permissions (membership + role)
5. Effectuer l'opération Prisma
6. Appeler revalidatePath() si nécessaire
7. Retourner ActionResult<T>

Pattern de retour :
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

Gère les erreurs avec try/catch et log console.error.
```

### 7.3 Créer une page

```
Crée la page [PATH] pour C4DENCE :

Structure requise :
1. page.tsx — Server Component principal
2. loading.tsx — Skeletons pendant le chargement
3. error.tsx — Error boundary (si logique spécifique)
4. actions.ts — Server Actions (si mutations)
5. _components/ — Client Components colocalisés (si nécessaire)

La page doit :
- Fetch les données directement avec Prisma (pas de useEffect)
- Vérifier les permissions
- Passer les données aux Client Components enfants
- Avoir un PageHeader approprié
```

### 7.4 Ajouter une validation Zod

```
Crée le schema de validation Zod pour [ENTITÉ] :

Fichier : lib/validations/[entité].ts

Inclus :
1. Schema de création (tous les champs requis)
2. Schema de mise à jour (partial + id requis)
3. Types TypeScript inférés (z.infer)
4. Messages d'erreur en français

Exemple de message custom :
z.string().min(1, { message: "Le nom est requis" })

Exporte les schemas ET les types.
```

---

## 8. Prompts de Debug

### 8.1 Erreur Prisma

```
J'ai cette erreur Prisma :
[COLLE L'ERREUR]

Contexte :
- Schema : c4dence (pas public)
- Base : Supabase PostgreSQL
- Fichier : [NOM DU FICHIER]

Aide-moi à :
1. Comprendre l'erreur
2. La corriger
3. Éviter qu'elle se reproduise
```

### 8.2 Erreur Server Component / Client Component

```
J'ai cette erreur de rendu React :
[COLLE L'ERREUR]

Le composant est dans : [CHEMIN]
Il a 'use client' : [OUI/NON]

Vérifie :
1. Si 'use client' est nécessaire ou pas
2. Si j'importe des modules serveur dans un Client Component
3. Si je passe des props non-sérialisables
```

### 8.3 Erreur RLS Supabase

```
Ma query Prisma retourne un tableau vide mais les données existent.

Query :
[COLLE LA QUERY]

Je soupçonne un problème RLS. Aide-moi à :
1. Vérifier que l'utilisateur est authentifié
2. Vérifier la policy RLS concernée
3. Tester la query en bypassant RLS (dev only)

Mon user ID : [UUID]
```

### 8.4 Problème de cache TanStack Query

```
Mon UI ne se met pas à jour après une mutation.

Mutation :
[CODE DE LA MUTATION]

Query à invalider :
[QUERY KEY]

Vérifie :
1. Que j'appelle queryClient.invalidateQueries correctement
2. Que la query key matche
3. Que revalidatePath est appelé côté serveur si Server Action
```

---

## 9. Prompts de Review

### 9.1 Review de code

```
Review ce code selon les conventions C4DENCE :

[COLLE LE CODE]

Vérifie :
□ Conventions de nommage (FR UI, EN code)
□ Pattern RSC correct
□ Typage TypeScript strict (pas de any)
□ Gestion d'erreurs
□ Accessibilité (aria-*, labels)
□ Performance (pas de re-renders inutiles)

Donne-moi les corrections à faire.
```

### 9.2 Review de PR

```
Je vais merger ce changement. Vérifie :

Fichiers modifiés :
[LISTE DES FICHIERS]

Changements principaux :
[DESCRIPTION]

Checklist :
□ Le code suit C4DENCE_CONVENTIONS.md
□ Les nouveaux composants sont dans C4DENCE_COMPONENTS.md
□ Les types sont à jour
□ Les Server Actions ont validation + auth
□ Pas de console.log oublié
□ Les messages UI sont en français
```

---

## 10. Template de Session

**À copier-coller au début de chaque session Claude Code :**

```
SESSION C4DENCE — [DATE]

OBJECTIF : [Ce que tu veux accomplir]

CONTEXTE :
- Dernier travail : [Résumé de la dernière session]
- Branche Git : [Nom de la branche]
- Fichiers concernés : [Liste]

DOCUMENTS CHARGÉS :
- C4DENCE_CONVENTIONS.md ✓
- C4DENCE_COMPONENTS.md ✓
- schema.prisma ✓

TÂCHES :
1. [ ] Tâche 1
2. [ ] Tâche 2
3. [ ] Tâche 3

Commençons par la tâche 1.
```

---

**Ces prompts sont optimisés pour Claude Code. Adapte-les selon le contexte spécifique de ta session.**
