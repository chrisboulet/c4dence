# C4DENCE — Documentation & Guide Utilisateur

## Objectif

Produire une documentation de qualité professionnelle pour :
1. **Clients** — Guide utilisateur simple et visuel
2. **Équipe client** — Formation à la méthodologie 4DX
3. **Administrateurs** — Configuration et gestion

---

## Documents à produire

### 1. GUIDE UTILISATEUR (priorité 1)

**Fichier** : `docs/guide-utilisateur.md`  
**Audience** : Utilisateurs finaux (non-techniques)  
**Ton** : Chaleureux, pratique, zéro jargon technique  
**Format** : Markdown avec screenshots annotés

```
Structure :

# Guide Utilisateur C4DENCE

## Bienvenue
- Qu'est-ce que C4DENCE ?
- La promesse : "Exécutez votre stratégie avec discipline"
- Connexion (Google OAuth)

## Premiers pas (5 minutes)
- Créer votre organisation
- Inviter votre équipe
- Comprendre le tableau de bord

## Les 4 Disciplines en action

### Discipline 1 : Définir vos objectifs (WIGs)
- Qu'est-ce qu'un WIG ?
- Comment créer un bon WIG (format "De X à Y")
- Exemples concrets par industrie
- Assigner un responsable
- ⚠️ Pourquoi se limiter à 2-3 WIGs

### Discipline 2 : Mesures prédictives
- Lead vs Lag measures (explication simple)
- Créer une mesure prédictive
- Saisir vos données hebdomadaires
- Lire les tendances (↑↓→)

### Discipline 3 : Le Scoreboard
- Comprendre les couleurs (vert/jaune/rouge)
- WINNING vs LOSING — que faire si on perd ?
- Lire les graphiques
- Mode plein écran pour affichage équipe

### Discipline 4 : La Cadence
- La réunion hebdomadaire (20-30 min)
- Utiliser le timer intégré
- Prendre des engagements (max 2)
- Signaler et résoudre les obstacles
- Rendre des comptes

## Fonctionnalités clés
- Naviguer entre les semaines
- Changer d'organisation
- Modifier mon profil
- Exporter les données (si disponible)

## FAQ
- "J'ai oublié de saisir mes données la semaine dernière"
- "Comment supprimer un WIG ?"
- "Qui peut voir mes données ?"
- "Comment ajouter un membre à l'équipe ?"

## Raccourcis clavier
- F : Mode plein écran scoreboard
- Etc.

## Besoin d'aide ?
- Contact support
- Ressources 4DX recommandées
```

### 2. GUIDE MÉTHODOLOGIE 4DX (priorité 2)

**Fichier** : `docs/methodologie-4dx.md`  
**Audience** : Leaders d'équipe, managers  
**Ton** : Pédagogique, inspirant  
**Format** : Markdown avec schémas (Mermaid)

```
Structure :

# La Méthodologie 4DX — Guide Complet

## Introduction
- Pourquoi 80% des stratégies échouent
- Le "Tourbillon" (Whirlwind) vs les objectifs
- Les 4 Disciplines : vue d'ensemble

## Discipline 1 : Focus sur l'Essentiel
- Le piège de tout vouloir faire
- Comment identifier votre WIG
- Le format "De X à Y d'ici [date]"
- Exercice : Définir votre WIG en équipe

## Discipline 2 : Agir sur les Leviers
- La différence Lead vs Lag (avec exemples)
- Comment trouver vos Lead Measures
- Le test : "Est-ce influençable ?"
- Exercice : Identifier 2 leviers pour votre WIG

## Discipline 3 : Garder le Score
- Pourquoi le score change le comportement
- Les 4 critères d'un bon scoreboard
- Visible, simple, Lead+Lag, créé par l'équipe

## Discipline 4 : La Cadence de Responsabilité
- L'anatomie d'une WIG Session (20 min)
- Les 5 phases : Account → Review → Plan → Clear → Commit
- L'engagement : spécifique et impactant
- Pourquoi la régularité est non-négociable

## Erreurs courantes
- Trop de WIGs
- Mesures non-influençables
- Scoreboard invisible
- Réunions annulées
- Engagements vagues

## Ressources
- Livre : "The 4 Disciplines of Execution"
- Vidéos FranklinCovey
- Templates fournis dans C4DENCE

## Annexe : Exemples par industrie
- Distribution
- Manufacturier
- Services professionnels
- Santé
```

### 3. GUIDE ADMINISTRATEUR (priorité 3)

**Fichier** : `docs/guide-admin.md`  
**Audience** : Admins/Owners d'organisation  
**Ton** : Précis, procédural  
**Format** : Markdown avec captures d'écran

```
Structure :

# Guide Administrateur C4DENCE

## Gestion de l'organisation
- Modifier les informations
- Configurer le jour/heure de cadence
- Personnaliser les paramètres

## Gestion des membres
- Inviter un nouveau membre
- Modifier les rôles (Owner/Admin/Member)
- Retirer un membre
- Permissions par rôle

## Gestion des données
- Archiver un WIG terminé
- Supprimer des données
- Exporter (si disponible)

## Bonnes pratiques
- Préparer le lancement avec l'équipe
- Former les nouveaux membres
- Maintenir la discipline sur le long terme

## Dépannage
- Un membre n'arrive pas à se connecter
- Les données ne se synchronisent pas
- Questions fréquentes des admins
```

---

## Format de livraison

### Option A : Markdown dans le repo
```
c4dence/
└── docs/
    ├── guide-utilisateur.md
    ├── methodologie-4dx.md
    ├── guide-admin.md
    └── images/
        ├── dashboard-overview.png
        ├── wig-creation.png
        ├── cadence-timer.png
        └── ...
```

### Option B : Site de documentation (recommandé)
- **Fumadocs** ou **Nextra** intégré à Next.js
- URL : docs.c4dence.bouletstrategies.ca
- Recherche intégrée
- Versioning

### Option C : PDF exportable
- Pour envoi aux clients avant onboarding
- Branding Boulet Stratégies TI
- Version imprimable

---

## Screenshots à capturer

Avant de générer la doc, capturer :

1. [ ] Page de connexion
2. [ ] Dashboard complet (avec données exemple)
3. [ ] Création d'un WIG (formulaire)
4. [ ] WigCard avec owner
5. [ ] Page détail WIG avec chart
6. [ ] Table Lead Measures avec saisie
7. [ ] Page Cadence avec timer
8. [ ] Formulaire engagement
9. [ ] Section Obstacles
10. [ ] Sélecteur d'organisation
11. [ ] Indicateur WINNING/LOSING
12. [ ] Trend arrows

---

## Données de démonstration

Créer un jeu de données réaliste pour les screenshots :

```
Organisation : "Distributeur ABC inc."

WIG 1 : "Augmenter les ventes B2B de 2.5M$ à 3.2M$ d'ici le 31 mars 2026"
- Owner : Marie Dupont
- Status : ON_TRACK
- Lead Measures :
  - "Appels de prospection" (cible: 50/sem, assigné: Jean)
  - "Démos produit" (cible: 10/sem, assigné: Marie)

WIG 2 : "Réduire le taux de retour de 8% à 3% d'ici le 30 juin 2026"  
- Owner : Pierre Martin
- Status : AT_RISK
- Lead Measures :
  - "Inspections qualité" (cible: 100%, assigné: Luc)

Engagements semaine 49 :
- Marie : "Contacter les 5 prospects prioritaires du CRM" ✅
- Jean : "Finaliser la présentation du nouveau produit" ⏳
- Pierre : "Former l'équipe sur le nouveau processus" ✅

Blocker :
- "Délai de livraison fournisseur impacte nos promesses client"
```

---

## Prompt pour Claude Code

```
Génère la documentation C4DENCE en suivant le fichier docs/C4DENCE_DOCUMENTATION.md

Ordre :
1. Guide utilisateur (guide-utilisateur.md)
2. Méthodologie 4DX (methodologie-4dx.md)  
3. Guide admin (guide-admin.md)

Pour chaque document :
- Markdown propre avec structure claire
- Placeholders [IMAGE: description] pour les screenshots
- Ton adapté à l'audience
- Exemples concrets (utilise les données de démo)
- FAQ basée sur questions probables

Crée aussi docs/images/.gitkeep pour le dossier images.

Langue : Français
```

---

## Livrable final

| Document | Pages | Audience | Priorité |
|----------|-------|----------|----------|
| Guide Utilisateur | ~15 | Tous | 🔴 P0 |
| Méthodologie 4DX | ~10 | Leaders | 🟡 P1 |
| Guide Admin | ~8 | Admins | 🟢 P2 |
| **Total** | **~33 pages** | | |

---

## Valeur ajoutée

Cette documentation devient :
- **Outil de vente** : "Regardez, on a une doc complète"
- **Réduction du support** : Clients autonomes
- **Formation intégrée** : Onboarding self-service
- **Crédibilité** : Produit mature, pas un side-project

---

**À lancer APRÈS le Big Bang, quand l'app est complète.**
