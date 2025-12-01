# C4DENCE — Rebranding Terminologique

## Contexte Légal

FranklinCovey détient des marques déposées sur "4DX" et "The 4 Disciplines of Execution". Pour commercialiser C4DENCE sans risque légal, nous devons remplacer TOUS les termes protégés par notre propre vocabulaire.

**Objectif** : Créer la "Méthode C4DENCE" — une méthodologie originale d'exécution stratégique inspirée des meilleures pratiques de l'industrie.

---

## Glossaire de Remplacement

### Termes Principaux

| Terme Protégé (À SUPPRIMER) | Nouveau Terme C4DENCE | Contexte |
|-----------------------------|----------------------|----------|
| 4DX | Méthode C4DENCE | Nom de la méthodologie |
| The 4 Disciplines of Execution | Les 4 Piliers de l'Exécution | Titre complet |
| Discipline 1, 2, 3, 4 | Pilier 1, 2, 3, 4 | Numérotation |
| WIG (Wildly Important Goal) | Objectif Prioritaire (OP) | Concept central |
| Wildly Important | Prioritaire / Stratégique | Adjectif |
| Lead Measure | Indicateur Prédictif (IP) | Mesures d'action |
| Lag Measure | Indicateur de Résultat (IR) | Mesures de résultat |
| Scoreboard | Tableau de Score | Visualisation |
| Cadence | Synchronisation | Réunion hebdo |
| Cadence Meeting | Réunion de Synchronisation | Réunion formelle |
| WIG Session | Session de Synchronisation | Réunion 4DX |
| Whirlwind | Tourbillon Opérationnel | Travail quotidien |
| FranklinCovey | (ne pas mentionner) | Société |
| McChesney / Covey / Huling | (ne pas mentionner) | Auteurs |

### Termes Techniques (Code)

| Ancien (Code) | Nouveau (Code) | Fichiers impactés |
|---------------|----------------|-------------------|
| `Wig` | `Objective` | schema.prisma, types, components |
| `wig` | `objective` | variables, fonctions |
| `WIG` | `OP` ou `Objective` | constantes, enums |
| `wigId` | `objectiveId` | foreign keys |
| `WigStatus` | `ObjectiveStatus` | enum |
| `WigCard` | `ObjectiveCard` | components |
| `WigForm` | `ObjectiveForm` | components |
| `LeadMeasure` | `PredictiveIndicator` | models, types |
| `leadMeasure` | `predictiveIndicator` | variables |
| `LagMeasure` | `ResultIndicator` | si utilisé |
| `CadenceMeeting` | `SyncMeeting` | models |
| `cadence` | `sync` | routes, variables |
| `/cadence` | `/sync` | URL routes |
| `/wig/` | `/objective/` | URL routes |
| `4DX` | `C4DENCE` | tout |
| `4dx` | `c4dence` | tout |

### Textes UI (Français)

| Ancien (UI) | Nouveau (UI) |
|-------------|--------------|
| "Vos objectifs ambitieux (WIGs)" | "Vos Objectifs Prioritaires" |
| "Nouveau WIG" | "Nouvel Objectif" |
| "Créer le WIG" | "Créer l'Objectif" |
| "Détail du WIG" | "Détail de l'Objectif" |
| "WIGs actifs" | "Objectifs actifs" |
| "Mesures prédictives" | "Indicateurs Prédictifs" |
| "Lead Measures" | "Indicateurs Prédictifs" |
| "Ajouter une mesure prédictive" | "Ajouter un Indicateur" |
| "Réunion de Cadence" | "Réunion de Synchronisation" |
| "Cadence" (nav) | "Synchronisation" |
| "Timer WIG Session" | "Timer de Session" |
| "Semaine de cadence" | "Semaine de synchronisation" |
| "4 Disciplines" | "4 Piliers" |
| "Discipline 1 : Se concentrer sur l'essentiel" | "Pilier 1 : Focus Stratégique" |
| "Discipline 2 : Agir sur les mesures prédictives" | "Pilier 2 : Actions Prédictives" |
| "Discipline 3 : Maintenir un tableau de bord" | "Pilier 3 : Visibilité Continue" |
| "Discipline 4 : Créer une cadence de responsabilité" | "Pilier 4 : Rythme de Responsabilité" |
| "Focus sur l'essentiel" | "Focus Stratégique" |

### Documentation & README

| Ancien | Nouveau |
|--------|---------|
| "basée sur la méthodologie 4DX" | "basée sur la Méthode C4DENCE" |
| "4DX (4 Disciplines of Execution)" | "Les 4 Piliers de l'Exécution Stratégique" |
| "méthodologie de FranklinCovey" | "méthodologie éprouvée d'exécution" |
| Toute citation de McChesney/Covey/Huling | Supprimer |
| Liens vers franklincovey.com | Supprimer |
| Références au livre "The 4 Disciplines" | Supprimer ou généraliser |

---

## Les 4 Piliers C4DENCE (Nouvelle Terminologie)

### Pilier 1 : Focus Stratégique
*Anciennement "Discipline 1: Focus on the Wildly Important"*

> Se concentrer sur 2-3 Objectifs Prioritaires maximum plutôt que disperser l'énergie sur tout.

**Concept clé** : Objectif Prioritaire (OP)
- Format : "De [X] à [Y] d'ici [date]"
- Mesurable, ambitieux, temporel
- Maximum 2-3 par organisation

### Pilier 2 : Actions Prédictives
*Anciennement "Discipline 2: Act on Lead Measures"*

> Identifier et suivre les actions qui influencent directement l'atteinte de l'objectif.

**Concept clé** : Indicateur Prédictif (IP)
- Mesure une action, pas un résultat
- Influençable par l'équipe
- Prédictif du succès

### Pilier 3 : Visibilité Continue
*Anciennement "Discipline 3: Keep a Compelling Scoreboard"*

> Maintenir un tableau de score visible qui permet de savoir en 5 secondes si on gagne.

**Concept clé** : Tableau de Score
- Simple et visuel
- Accessible à tous
- Mis à jour en temps réel

### Pilier 4 : Rythme de Responsabilité
*Anciennement "Discipline 4: Create a Cadence of Accountability"*

> Établir un rythme régulier de réunions courtes où chacun rend des comptes.

**Concept clé** : Réunion de Synchronisation
- 20-30 minutes hebdomadaires
- Revue des engagements
- Nouveaux engagements

---

## Instructions pour Claude Code

### Étape 1 : Analyse Complète

```
Avant de modifier quoi que ce soit, fais une analyse complète du projet :

1. Recherche TOUS les fichiers contenant ces termes (insensible à la casse) :
   - "4DX" ou "4dx"
   - "WIG" ou "wig" ou "Wig"
   - "Wildly Important"
   - "Lead Measure" ou "LeadMeasure" ou "leadMeasure"
   - "Lag Measure" ou "LagMeasure"
   - "Cadence" ou "cadence" (attention : "C4DENCE" doit rester)
   - "FranklinCovey" ou "Franklin Covey"
   - "McChesney" ou "Covey" ou "Huling"
   - "Discipline 1" / "Discipline 2" / "Discipline 3" / "Discipline 4"
   - "Scoreboard" (dans le contexte 4DX)

2. Liste chaque occurrence avec :
   - Fichier
   - Ligne
   - Contexte (code, UI, commentaire, doc)
   
3. Présente-moi le rapport AVANT de commencer les modifications.
```

### Étape 2 : Modifications Schema Prisma

```
Modifie prisma/schema.prisma :

1. Renommer le model Wig → Objective
2. Renommer WigStatus → ObjectiveStatus
3. Renommer tous les champs wigId → objectiveId
4. Renommer LeadMeasure → PredictiveIndicator (optionnel, ou garder le nom technique)
5. Mettre à jour toutes les relations

Après modification :
- npx prisma migrate dev --name rebrand_terminology
- npx prisma generate
```

### Étape 3 : Modifications Types TypeScript

```
Modifie src/types/ :

1. Renommer tous les types Wig* → Objective*
2. Renommer WigStatus → ObjectiveStatus
3. Renommer LeadMeasure* → PredictiveIndicator* (ou garder)
4. Mettre à jour les imports partout
```

### Étape 4 : Modifications Components

```
Renommer les fichiers et leur contenu :

components/wig/ → components/objective/
- WigCard.tsx → ObjectiveCard.tsx
- WigForm.tsx → ObjectiveForm.tsx
- WigList.tsx → ObjectiveList.tsx
- etc.

components/lead-measure/ → components/indicator/ (optionnel)

components/cadence/ → components/sync/

Mettre à jour tous les imports.
```

### Étape 5 : Modifications Routes (App Router)

```
Renommer les dossiers de routes :

app/(dashboard)/wigs/ → app/(dashboard)/objectives/
app/(dashboard)/wig/[id]/ → app/(dashboard)/objective/[id]/
app/(dashboard)/cadence/ → app/(dashboard)/sync/

Mettre à jour :
- Tous les Link href
- Tous les redirect()
- Tous les revalidatePath()
- La navigation dans le header/sidebar
```

### Étape 6 : Modifications UI (Textes Français)

```
Rechercher et remplacer dans TOUS les fichiers JSX/TSX :

"WIG" → "Objectif" (dans les textes visibles)
"WIGs" → "Objectifs"
"Nouveau WIG" → "Nouvel Objectif"
"Cadence" → "Synchronisation" (dans la nav et les titres)
"Réunion de Cadence" → "Réunion de Synchronisation"
"mesure prédictive" → "indicateur prédictif"
"mesures prédictives" → "indicateurs prédictifs"
"Discipline" → "Pilier" (dans les descriptions)
"4DX" → "C4DENCE" ou "Méthode C4DENCE"
```

### Étape 7 : Modifications Documentation

```
Fichiers à modifier :
- README.md
- docs/guide-utilisateur.md
- docs/methodologie-4dx.md → docs/methode-c4dence.md
- docs/guide-admin.md
- Tout fichier .md dans le projet

Actions :
1. Remplacer toute la terminologie 4DX
2. Supprimer les références à FranklinCovey
3. Supprimer les citations des auteurs
4. Supprimer les liens vers ressources FranklinCovey
5. Présenter C4DENCE comme méthodologie originale
```

### Étape 8 : Vérification Finale

```
Après toutes les modifications :

1. Recherche globale de termes résiduels :
   grep -ri "4dx\|wig\|wildly\|franklincovey\|mcchesney" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

2. Vérifier que l'app compile :
   npm run build

3. Vérifier que les tests passent (si existants) :
   npm test

4. Vérifier visuellement chaque page

5. Confirmer que AUCUNE mention de termes protégés ne reste
```

---

## Exceptions (Ne PAS modifier)

| Terme | Raison |
|-------|--------|
| `C4DENCE` | Notre marque (le "4" est intégré) |
| `c4dence` | Nom du projet/package |
| Commentaires historiques Git | Impossible à modifier |
| node_modules | Dépendances externes |

---

## Texte Marketing Révisé

### Ancien (À SUPPRIMER)
> "C4DENCE est une application basée sur la méthodologie 4DX (4 Disciplines of Execution) de FranklinCovey..."

### Nouveau (À UTILISER)
> "C4DENCE implémente une méthode éprouvée d'exécution stratégique en 4 piliers : Focus Stratégique, Actions Prédictives, Visibilité Continue et Rythme de Responsabilité. Transformez vos objectifs ambitieux en résultats mesurables."

---

## Checklist Finale

- [ ] Aucune mention de "4DX" dans le code
- [ ] Aucune mention de "WIG" (remplacé par "Objective" ou "Objectif")
- [ ] Aucune mention de "Wildly Important"
- [ ] Aucune mention de "FranklinCovey"
- [ ] Aucune mention des auteurs (McChesney, Covey, Huling)
- [ ] Aucun lien vers franklincovey.com
- [ ] Routes renommées (/objectives, /sync)
- [ ] Components renommés
- [ ] Types renommés
- [ ] Schema Prisma migré
- [ ] Documentation mise à jour
- [ ] README mis à jour
- [ ] App compile sans erreur
- [ ] UI affiche la nouvelle terminologie

---

## Prompt pour Claude Code

```
@C4DENCE_REBRANDING.md

Exécute le rebranding terminologique complet de C4DENCE.

IMPORTANT : 
1. Commence par l'Étape 1 (Analyse) et montre-moi le rapport complet
2. Attends ma validation avant de modifier
3. Procède étape par étape avec un commit par étape
4. Vérifie que l'app compile après chaque étape majeure

L'objectif est de supprimer TOUTE référence aux termes protégés par FranklinCovey et créer notre propre vocabulaire "Méthode C4DENCE".

GO !
```

---

## Estimation

| Étape | Temps |
|-------|-------|
| 1. Analyse | 5 min |
| 2. Schema Prisma | 10 min |
| 3. Types | 10 min |
| 4. Components | 15 min |
| 5. Routes | 10 min |
| 6. UI Textes | 15 min |
| 7. Documentation | 15 min |
| 8. Vérification | 10 min |
| **Total** | **~90 min** |

---

**Ce rebranding transforme C4DENCE en produit commercialisable sans risque légal.**
