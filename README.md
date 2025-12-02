<p align="center">
  <img src="public/logo_icon_wordmark_dark.png" alt="C4DENCE" width="280" />
</p>

<p align="center">
  <strong>Plateforme d'exécution stratégique basée sur la Méthode C4DENCE</strong>
</p>

<p align="center">
  <a href="https://c4dence.bouletstrategies.ca">Live Demo</a> •
  <a href="METHODE_C4DENCE_MANUEL.md">Manuel de la Méthode</a> •
  <a href="docs/guide-utilisateur.md">Guide Utilisateur</a> •
  <a href="docs/guide-admin.md">Guide Admin</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-7-2d3748?style=flat-square&logo=prisma" alt="Prisma" />
</p>

---

<p align="center">
  <img src="docs/images/02-dashboard-desktop.png" alt="C4DENCE Dashboard" width="800" />
</p>

---

## Vue d'ensemble

**C4DENCE** transforme vos objectifs stratégiques en résultats mesurables grâce à la **Méthode C4DENCE** — une méthodologie éprouvée d'exécution stratégique en 4 piliers.

> *"La stratégie sans exécution n'est qu'une illusion. L'exécution sans stratégie n'est que de l'agitation."*

### Pourquoi C4DENCE?

| Problème | Solution C4DENCE |
|----------|------------------|
| Trop d'objectifs = aucun focus | **Pilier 1** : Focus sur 2-3 Objectifs Prioritaires |
| On mesure les résultats trop tard | **Pilier 2** : Indicateurs Prédictifs mesurables |
| L'équipe ne sait pas si elle gagne | **Pilier 3** : Tableau de Score visuel et clair |
| Les urgences prennent le dessus | **Pilier 4** : Rythme de Synchronisation hebdomadaire |

### Les 4 Piliers de la Méthode C4DENCE

| Pilier | Nom | Description |
|--------|-----|-------------|
| **Pilier 1** | Focus Stratégique | Définir 2-3 Objectifs Prioritaires maximum |
| **Pilier 2** | Actions Prédictives | Identifier les Indicateurs Prédictifs qui influencent le résultat |
| **Pilier 3** | Visibilité Continue | Maintenir un Tableau de Score visible (Victoire ou Danger en 5 secondes) |
| **Pilier 4** | Rythme de Responsabilité | Réunions de Synchronisation hebdomadaires avec engagements |

> 📘 Pour une explication complète de la méthodologie, consultez le [Manuel de la Méthode C4DENCE](METHODE_C4DENCE_MANUEL.md).

---

## Fonctionnalités

### Objectifs Prioritaires (OP)
- Format "De X à Y d'ici [date]"
- Progression visuelle avec indicateur VICTOIRE/DANGER
- Statuts automatiques : En bonne voie / À risque / Hors piste
- Attribution de propriétaire

### Indicateurs Prédictifs (IP)
- Actions hebdomadaires mesurables
- Cibles par semaine configurables
- Tendances avec flèches directionnelles (↑↓→)
- Charts de performance

### Tableau de Score
- Dashboard avec KPIs temps réel
- Charts Tremor pour visualisations
- Progression OP vs trajectoire idéale
- Indicateur VICTOIRE/DANGER proéminent

### Synchronisation (Rythme de Responsabilité)
- Page de réunion dédiée avec timer
- Navigation par semaine
- Engagements par membre (max 2)
- Gestion des obstacles
- Agenda structuré en 5 phases

### Multi-Tenant
- Organisations isolées
- Invitations par email (via Resend)
- Rôles : Propriétaire > Admin > Membre
- Sélecteur d'organisation

### Authentification
- Google OAuth (comptes personnels et Workspace)
- Microsoft 365 OAuth (multi-tenant Azure AD)
- Connexion SSO pour entreprises

### Super Admin
- Module d'administration réservé à l'opérateur
- Gestion de toutes les organisations (CRUD)
- Activation/désactivation d'organisations
- Envoi d'invitations administratives
- Vue globale des utilisateurs

---

## Stack Technique

| Technologie | Usage |
|------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **React 19** | Interface utilisateur |
| **TypeScript** | Typage statique |
| **Tailwind CSS 4** | Styling utility-first |
| **Prisma 7** | ORM avec adapter pattern |
| **Supabase** | Auth (Google + Microsoft OAuth) + PostgreSQL |
| **Tremor** | Charts et visualisations |
| **shadcn/ui** | Composants UI accessibles |
| **Resend** | Emails transactionnels |

---

## Démarrage Rapide

### Prérequis

- Node.js 20+
- Compte Supabase
- Credentials Google OAuth
- Compte Resend (pour les emails)

### Installation

```bash
# Cloner le repo
git clone https://github.com/BouletStrategies/c4dence.git
cd c4dence

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Configuration

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database (Supavisor pooler)
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...

# Resend (emails)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="C4dence <noreply@yourdomain.com>"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma
npx prisma db push
```

### Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Manuel de la Méthode C4DENCE](METHODE_C4DENCE_MANUEL.md) | La méthodologie complète des 4 Piliers | Leaders, Managers, Tous |
| [Guide Utilisateur](docs/guide-utilisateur.md) | Prise en main de l'application | Tous les utilisateurs |
| [Guide Administrateur](docs/guide-admin.md) | Configuration et gestion | Admins, Owners |

---

## Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   │   ├── login/         # Connexion Google/Microsoft OAuth
│   │   ├── callback/      # OAuth callback
│   │   ├── onboarding/    # Création première org
│   │   └── invite/[token] # Acceptation invitation
│   ├── admin/             # Super Admin (accès restreint)
│   │   ├── page.tsx       # Liste organisations
│   │   ├── organizations/ # Détail organisation
│   │   └── users/         # Liste utilisateurs
│   ├── dashboard/         # Routes protégées
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── wigs/          # Liste et détail Objectifs Prioritaires
│   │   ├── cadence/       # Réunion de Synchronisation
│   │   ├── members/       # Gestion membres
│   │   └── settings/      # Paramètres organisation
│   └── actions/           # Server Actions
├── components/
│   ├── ui/                # shadcn/ui
│   ├── providers/         # React Context
│   ├── layout/            # Header, navigation
│   ├── wig/               # Composants Objectif Prioritaire
│   ├── lead-measure/      # Indicateurs Prédictifs
│   ├── engagement/        # Engagements
│   ├── cadence/           # Synchronisation meeting
│   └── charts/            # Tremor charts
├── lib/                   # Utilitaires
│   ├── prisma.ts          # Client Prisma
│   ├── supabase/          # Clients Supabase
│   ├── email.ts           # Service Resend
│   ├── permissions.ts     # Matrice permissions
│   └── week.ts            # Utilitaires semaine ISO
└── types/                 # Types TypeScript
```

---

## Design System

### Couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Purple | `#684bf8` | Primaire, actions |
| Cyan | `#11e6ba` | Success, En bonne voie |
| Gold | `#fcdc76` | Warning, À risque |
| Lime | `#9bef8e` | Success secondaire |

### Statuts Objectif Prioritaire

| Statut | Couleur | Condition |
|--------|---------|-----------|
| En bonne voie | Cyan | Progression >= 90% attendu |
| À risque | Gold | Progression 70-90% |
| Hors piste | Rouge | Progression < 70% |
| Atteint | Or | Objectif complété |

---

## Screenshots

<details>
<summary>Voir toutes les captures d'écran</summary>

### Login
![Login](docs/images/01-login-desktop.png)

### Dashboard
![Dashboard](docs/images/02-dashboard-desktop.png)

### Liste des WIGs
![WIGs](docs/images/05-wigs-list-desktop.png)

### Page Synchronisation
![Synchronisation](docs/images/12-cadence-page-desktop.png)

### Gestion des Membres
![Members](docs/images/17-members-desktop.png)

### Paramètres
![Settings](docs/images/18-settings-desktop.png)

</details>

---

## Responsive

C4DENCE s'adapte à tous les écrans :

| Desktop (1440px) | Tablet (768px) | Mobile (375px) |
|------------------|----------------|----------------|
| ![Desktop](docs/images/02-dashboard-desktop.png) | ![Tablet](docs/images/02-dashboard-tablet.png) | ![Mobile](docs/images/02-dashboard-mobile.png) |

---

## Roadmap

- [x] Objectifs Prioritaires avec progression
- [x] Indicateurs Prédictifs hebdomadaires
- [x] Tableau de Score avec charts
- [x] Réunion de Synchronisation
- [x] Multi-tenant avec invitations
- [x] Emails d'invitation (Resend)
- [x] Microsoft 365 OAuth (multi-tenant)
- [x] Module Super Admin
- [ ] Export PDF des rapports
- [ ] Notifications (rappels synchronisation)
- [ ] Intégration calendrier
- [ ] API publique

---

## Contribuer

Les contributions sont les bienvenues!

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## Support

- **Email** : support@bouletstrategies.ca
- **Documentation** : [docs/](docs/)

---

## License

MIT © [Boulet Stratégies TI](https://bouletstrategies.ca)

---

<p align="center">
  <img src="public/logo-boulet-strategies-dark.svg" alt="Boulet Stratégies TI" width="150" />
</p>

<p align="center">
  <sub>Construit avec passion par <a href="https://bouletstrategies.ca">Boulet Stratégies TI</a></sub>
</p>
