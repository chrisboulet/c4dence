# C4DENCE BIG BANG — De 6.5/10 à 9/10

## Contexte
On a un MVP fonctionnel. On veut implémenter toutes les améliorations 4DX en une session.

## Ordre d'implémentation

### 1. MULTI-TENANT (P0 - 2h)

```
Objectif : Permettre à un utilisateur d'appartenir à plusieurs organisations

1.1 Créer src/contexts/organization-context.tsx :
- OrganizationProvider avec state currentOrganization
- Persister le choix dans localStorage (clé: 'c4dence-org-id')
- Hook useOrganization() qui retourne { currentOrg, setCurrentOrg, organizations }

1.2 Modifier le header (components/layout/header.tsx) :
- Ajouter un Dropdown "Sélecteur d'organisation"
- Afficher : nom de l'org + rôle (OWNER/ADMIN/MEMBER)
- Au clic : changer le context + reload les données

1.3 Créer app/(dashboard)/onboarding/page.tsx :
- Si user n'a aucun membership → rediriger ici
- Form : "Nom de votre organisation"
- Server Action : créer org + membership OWNER

1.4 Modifier tous les fetches :
- Dashboard, WIGs, Cadence : filtrer par currentOrg.id
- Le RLS fait le reste côté Supabase
```

### 2. DISCIPLINE 1 — FOCUS (P0 - 2h)

```
Objectif : Respecter la règle "Max 2-3 WIGs"

2.1 Warning WIGs excessifs :
- Dans le dashboard, si wigsCount > 3 :
- Afficher Alert warning : "4DX recommande de se concentrer sur 2-3 objectifs maximum"
- Lien vers article 4DX

2.2 WIG Owner obligatoire :
- Modifier schema.prisma : ajouter ownerId String sur Wig (FK vers Profile)
- Modifier WigForm : ajouter Select "Responsable" (liste des membres de l'org)
- Validation : ownerId requis

2.3 Afficher Owner sur WigCard :
- Avatar + nom du owner en bas de la card
- Tooltip : "Responsable : [nom]"

2.4 État ACHIEVED :
- Ajouter ACHIEVED à l'enum WigStatus
- Logique : si currentValue >= targetValue → ACHIEVED
- Afficher badge vert "Objectif atteint !" 
- Bonus : animation confetti (react-confetti) quand on atteint 100%
```

### 3. DISCIPLINE 2 — LEAD MEASURES (P0 - 1h)

```
Objectif : Chaque mesure a un responsable

3.1 Assigné sur Lead Measure :
- Modifier schema.prisma : ajouter assignedToId String sur LeadMeasure
- Modifier LeadMeasureForm : ajouter Select "Assigné à"
- Afficher l'avatar de l'assigné dans la table

3.2 Limite Lead Measures :
- Warning si on essaie d'ajouter une 4e Lead Measure
- Message : "4DX recommande 2-3 mesures prédictives par objectif"
```

### 4. DISCIPLINE 3 — SCOREBOARD (P0 - 1h)

```
Objectif : Savoir si on gagne en 5 secondes

4.1 Trend arrows :
- Composant TrendArrow : compare valeur semaine N vs N-1
- ↑ vert si amélioration
- ↓ rouge si régression  
- → gris si stable (±5%)
- Afficher sur chaque Lead Measure dans la table

4.2 Indicateur WINNING/LOSING :
- En haut du dashboard, gros badge :
- "WINNING 🏆" (vert) si >50% des WIGs sont ON_TRACK
- "LOSING ⚠️" (rouge) si ≤50% sont ON_TRACK ou OFF_TRACK
- Taille : text-4xl, impossible à rater
```

### 5. DISCIPLINE 4 — CADENCE (P0 - 2h)

```
Objectif : Structure de réunion + accountability

5.1 Limite engagements :
- Max 2 engagements par personne par semaine
- Si l'user essaie d'en créer un 3e : Dialog de confirmation
- "Vous avez déjà 2 engagements. 4DX recommande de se concentrer sur 1-2 engagements clés."

5.2 Timer WIG Session :
- Composant WigSessionTimer dans la page Cadence
- 5 phases : Account (5min) → Review (5min) → Plan (10min) → Clear (5min) → Commit (5min)
- Bouton Play/Pause/Reset
- Son de notification à chaque changement de phase
- Affichage : phase actuelle + temps restant

5.3 Model Blocker :
- Ajouter au schema.prisma :
  model Blocker {
    id           String   @id @default(cuid())
    description  String
    wigId        String
    wig          Wig      @relation(fields: [wigId], references: [id])
    reportedById String
    reportedBy   Profile  @relation(fields: [reportedById], references: [id])
    status       BlockerStatus @default(OPEN)
    escalatedTo  String?
    createdAt    DateTime @default(now())
    resolvedAt   DateTime?
  }
  
  enum BlockerStatus {
    OPEN
    ESCALATED
    RESOLVED
  }

5.4 Section Obstacles :
- Dans la page Cadence, section "Obstacles à lever"
- Liste des blockers OPEN
- Bouton "Signaler un obstacle" → Dialog avec form
- Actions : Escalader / Marquer résolu
```

### 6. NICE-TO-HAVE

```
Si le temps le permet :

6.1 Lien Engagement → Lead Measure :
- Ajouter leadMeasureId optionnel sur Engagement
- Select dans le form : "Cet engagement impacte quelle mesure ?"
- Afficher le lien dans la card engagement

6.2 Mode Fullscreen Scoreboard :
- Bouton "Plein écran" ou touche F
- Cache le header/sidebar
- Affiche uniquement : WIGs + Lead Measures + WINNING/LOSING
- Idéal pour affichage TV
```

## Commandes utiles

```bash
# Après modification du schema
npx prisma migrate dev --name add_owner_assignee_blocker
npx prisma generate

# Pour le confetti
npm install react-confetti

# Pour le son du timer (optionnel)
# Utiliser un simple <audio> avec fichier mp3 dans /public
```

## Checklist finale

- [ ] Multi-tenant fonctionnel
- [ ] Sélecteur d'organisation dans le header
- [ ] Warning si >3 WIGs
- [ ] Owner sur chaque WIG
- [ ] Assigné sur chaque Lead Measure
- [ ] Trend arrows (↑↓→)
- [ ] Badge WINNING/LOSING visible
- [ ] Limite 2 engagements/semaine
- [ ] Timer WIG Session
- [ ] Model Blocker + UI

## Objectif

Score 4DX : **9/10**
Temps estimé : **5-8 heures**

LET'S GO! 🚀
