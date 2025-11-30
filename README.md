<p align="center">
  <img src="public/logo-boulet-strategies-dark.svg" alt="C4DENCE Logo" width="200" />
</p>

<h1 align="center">C4DENCE</h1>

<p align="center">
  <strong>Exécution stratégique basée sur les 4 Disciplines de l'Exécution (4DX)</strong>
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#méthodologie-4dx">Méthodologie</a> •
  <a href="#stack-technique">Stack</a> •
  <a href="#démarrage-rapide">Démarrage</a>
</p>

---

## Vue d'ensemble

**C4DENCE** est une application web moderne conçue pour aider les équipes à exécuter leur stratégie avec discipline et focus. Basée sur la méthodologie **4DX** (4 Disciplines of Execution) de FranklinCovey, elle transforme vos objectifs ambitieux en résultats mesurables.

> *"L'exécution est la discipline qui permet de transformer la stratégie en réalité."*

## Méthodologie 4DX

Les 4 Disciplines de l'Exécution forment un cadre éprouvé pour atteindre des objectifs importants malgré le "tourbillon" du quotidien:

### Discipline 1: Focus sur l'Essentiel
**WIGs (Wildly Important Goals)** - Se concentrer sur 1-3 objectifs vitalement importants plutôt que de disperser l'énergie sur tout.

### Discipline 2: Agir sur les Mesures Prédictives
**Lead Measures** - Identifier et suivre les actions qui influencent directement l'atteinte du WIG (mesures prédictives vs résultats).

### Discipline 3: Maintenir un Tableau de Bord Engageant
**Scoreboard** - Visualiser la progression de façon claire et motivante. Les gens jouent différemment quand ils gardent le score.

### Discipline 4: Créer une Cadence de Responsabilité
**Cadence Meetings** - Réunions hebdomadaires courtes où chaque membre rend des comptes et prend de nouveaux engagements.

## Fonctionnalités

### WIGs (Objectifs)
- Création et suivi d'objectifs avec dates de début/fin
- Mesure de progression (valeur départ → actuelle → cible)
- Status automatique: En bonne voie / À risque / Hors piste
- Visualisation de la progression vs temps écoulé

### Lead Measures (Mesures Prédictives)
- Association de mesures prédictives à chaque WIG
- Enregistrement hebdomadaire des valeurs
- Cible par semaine configurable
- Charts de performance hebdomadaire

### Scoreboard (Tableau de Bord)
- Charts Tremor pour visualisation des tendances
- Progression WIG (AreaChart) - réel vs cible linéaire
- Lead Measures (BarChart) - performance hebdo vs cible
- KPIs en temps réel sur le dashboard

### Cadence (Responsabilité)
- Page de réunion de cadence dédiée
- Navigation par semaine (précédente/suivante)
- Vue des engagements de l'équipe
- Gestion des engagements personnels
- Agenda structuré en 5 étapes

## Stack Technique

| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js** | 16 | Framework React avec App Router |
| **React** | 19 | Interface utilisateur |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4 | Styling utility-first |
| **Prisma** | 7 | ORM avec adapter pattern |
| **Supabase** | - | Auth (Google OAuth) + PostgreSQL |
| **Tremor** | 3 | Charts et visualisations |
| **shadcn/ui** | - | Composants UI accessibles |
| **TanStack Query** | 5 | Data fetching & caching |

## Démarrage Rapide

### Prérequis
- Node.js 20+
- Compte Supabase
- Google OAuth credentials (optionnel)

### Installation

```bash
# Cloner le repo
git clone https://github.com/chrisboulet/c4dence.git
cd c4dence

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Configuration

Créer un fichier `.env.local` avec:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database (Supavisor pooler)
DATABASE_URL=postgresql://...?pgbouncer=true

# Optional: Direct connection for migrations
DIRECT_DATABASE_URL=postgresql://...
```

### Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers Supabase
npx prisma db push
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes auth (login)
│   ├── (dashboard)/       # Routes protégées
│   │   └── dashboard/
│   │       ├── page.tsx   # Dashboard principal
│   │       ├── wigs/      # Liste et détail WIGs
│   │       └── cadence/   # Page réunion cadence
│   └── actions/           # Server Actions
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── wig/               # Composants WIG
│   ├── lead-measure/      # Composants Lead Measures
│   ├── engagement/        # Composants Engagements
│   ├── cadence/           # Composants Cadence
│   ├── charts/            # Charts Tremor
│   └── layout/            # Header, navigation
├── lib/                   # Utilitaires
│   ├── prisma.ts          # Client Prisma
│   ├── supabase/          # Clients Supabase
│   └── week.ts            # Utilitaires semaine
└── types/                 # Types TypeScript
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Page de connexion |
| `/dashboard` | Vue d'ensemble avec KPIs |
| `/dashboard/wigs` | Liste de tous les WIGs |
| `/dashboard/wigs/[id]` | Détail WIG + charts |
| `/dashboard/cadence` | Réunion de cadence hebdo |

## Design System

### Couleurs de marque

```css
--brand-purple: #684bf8   /* Primaire */
--brand-cyan: #11e6ba     /* Accent / On-track */
--brand-gold: #fcdc76     /* Warning / At-risk */
--brand-lime: #9bef8e     /* Success secondaire */
```

### Status

- **On-track** (cyan): Progression ≥ 90% de l'attendu
- **At-risk** (gold): Progression entre 70-90%
- **Off-track** (rouge): Progression < 70%

## Contribuer

Les contributions sont les bienvenues!

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## License

MIT © [Boulet Stratégies TI](https://bouletstrategies.com)

---

<p align="center">
  Construit avec passion par <a href="https://bouletstrategies.com">Boulet Stratégies TI</a>
</p>
