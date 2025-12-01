# C4DENCE — Captures d'écran automatisées avec Playwright MCP

## Objectif

Capturer toutes les pages de C4DENCE en mode desktop ET mobile pour la documentation.

---

## Prérequis

1. L'app C4DENCE tourne sur `http://localhost:3000`
2. Un utilisateur test est connecté avec des données de démo
3. Playwright MCP est configuré dans Claude Code

---

## Données de démonstration à créer d'abord

Avant les captures, s'assurer que ces données existent :

```
Organisation : "Distributeur ABC inc."

WIG 1 : "Augmenter les ventes B2B de 2.5M$ à 3.2M$"
- Owner : Marie Dupont
- Progression : 65%
- Status : ON_TRACK
- Lead Measures :
  - "Appels prospection" : 45/50 cette semaine ↑
  - "Démos produit" : 8/10 cette semaine ↓

WIG 2 : "Réduire le taux de retour de 8% à 3%"
- Owner : Pierre Martin
- Progression : 35%
- Status : AT_RISK
- Lead Measures :
  - "Inspections qualité" : 92/100 ↑

WIG 3 : "Former 100% de l'équipe sur le nouveau CRM"
- Owner : Jean Tremblay
- Progression : 100%
- Status : ACHIEVED ✅

Engagements semaine courante :
- Marie : "Contacter les 5 prospects prioritaires" (COMPLETED)
- Jean : "Finaliser la présentation produit" (PENDING)
- Pierre : "Former l'équipe logistique" (PENDING)

Blocker :
- "Délai fournisseur impacte les livraisons" (OPEN)
```

---

## Script de captures

### Viewports

```javascript
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};
```

### Pages à capturer

```javascript
const pages = [
  // Auth
  { name: '01-login', path: '/login', description: 'Page de connexion' },
  
  // Dashboard
  { name: '02-dashboard', path: '/dashboard', description: 'Tableau de bord principal' },
  { name: '03-dashboard-winning', path: '/dashboard', description: 'Dashboard avec badge WINNING', state: 'winning' },
  { name: '04-dashboard-losing', path: '/dashboard', description: 'Dashboard avec badge LOSING', state: 'losing' },
  
  // WIGs
  { name: '05-wigs-list', path: '/dashboard/wigs', description: 'Liste des WIGs' },
  { name: '06-wig-create', path: '/dashboard/wigs/new', description: 'Formulaire création WIG' },
  { name: '07-wig-detail', path: '/dashboard/wigs/[id]', description: 'Détail WIG avec charts' },
  { name: '08-wig-achieved', path: '/dashboard/wigs/[achieved-id]', description: 'WIG atteint avec confetti' },
  
  // Lead Measures
  { name: '09-lead-measures-table', path: '/dashboard/wigs/[id]#measures', description: 'Table des mesures prédictives' },
  { name: '10-lead-measure-input', path: '/dashboard/wigs/[id]', description: 'Saisie hebdomadaire (focus sur input)', action: 'focus-input' },
  { name: '11-trend-arrows', path: '/dashboard/wigs/[id]', description: 'Zoom sur les trend arrows' },
  
  // Cadence
  { name: '12-cadence-page', path: '/dashboard/cadence', description: 'Page réunion de cadence' },
  { name: '13-cadence-timer', path: '/dashboard/cadence', description: 'Timer WIG Session en cours', action: 'start-timer' },
  { name: '14-engagement-form', path: '/dashboard/cadence', description: 'Formulaire engagement', action: 'open-engagement-dialog' },
  { name: '15-blockers-section', path: '/dashboard/cadence', description: 'Section obstacles' },
  
  // Navigation
  { name: '16-org-selector', path: '/dashboard', description: 'Sélecteur organisation ouvert', action: 'open-org-dropdown' },
  { name: '17-user-menu', path: '/dashboard', description: 'Menu utilisateur ouvert', action: 'open-user-menu' },
  { name: '18-week-navigation', path: '/dashboard/cadence', description: 'Navigation par semaine' },
  
  // États spéciaux
  { name: '19-empty-state', path: '/dashboard', description: 'Dashboard vide (nouvel utilisateur)', state: 'empty' },
  { name: '20-warning-too-many-wigs', path: '/dashboard', description: 'Warning trop de WIGs', state: '4-wigs' },
  
  // Fullscreen
  { name: '21-scoreboard-fullscreen', path: '/dashboard', description: 'Scoreboard mode plein écran', action: 'fullscreen' },
  
  // Onboarding
  { name: '22-onboarding', path: '/onboarding', description: 'Création première organisation' },
];
```

---

## Prompt Playwright MCP

```
Utilise Playwright MCP pour capturer des screenshots de C4DENCE.

L'app tourne sur http://localhost:3000

Pour chaque page listée, capture 3 versions :
- Desktop (1440x900)
- Tablet (768x1024)  
- Mobile (375x812)

Sauvegarde dans : docs/images/

Naming convention :
- {numero}-{nom}-desktop.png
- {numero}-{nom}-tablet.png
- {numero}-{nom}-mobile.png

Exemple :
- 02-dashboard-desktop.png
- 02-dashboard-tablet.png
- 02-dashboard-mobile.png

Pages à capturer :

1. /login - Page de connexion
2. /dashboard - Tableau de bord (après login)
3. /dashboard/wigs - Liste des WIGs
4. /dashboard/wigs/[premier-wig-id] - Détail d'un WIG
5. /dashboard/cadence - Page de cadence
6. Menu organisation ouvert (cliquer sur le sélecteur)
7. Dialog création WIG ouvert
8. Timer de réunion démarré

Pour le login, utilise les credentials de test ou simule une session authentifiée.

Avant de commencer, assure-toi que des données de démo existent pour avoir des screenshots réalistes.
```

---

## Structure des fichiers générés

```
docs/
└── images/
    ├── 01-login-desktop.png
    ├── 01-login-tablet.png
    ├── 01-login-mobile.png
    ├── 02-dashboard-desktop.png
    ├── 02-dashboard-tablet.png
    ├── 02-dashboard-mobile.png
    ├── 03-wig-detail-desktop.png
    ├── 03-wig-detail-tablet.png
    ├── 03-wig-detail-mobile.png
    ├── ...
    └── README.md (index des captures)
```

---

## Captures annotées (optionnel)

Pour les guides, on peut annoter les captures avec des callouts :

```
Après les captures brutes, utilise Sharp ou Canvas pour ajouter :
- Cercles rouges autour des éléments importants
- Numéros (1, 2, 3) pour les étapes
- Flèches pointant vers les boutons

Ou simplement documenter les annotations à faire manuellement dans Figma/Canva.
```

---

## Commande unique

```bash
# Dans Claude Code avec Playwright MCP
claude "Capture tous les screenshots de C4DENCE selon @C4DENCE_SCREENSHOTS.md"
```

---

## Estimation

| Tâche | Temps |
|-------|-------|
| Setup données démo | 15 min |
| Captures automatisées (22 pages × 3 viewports) | 10 min |
| Review et re-captures si nécessaire | 15 min |
| **Total** | **~40 min** |

---

## Avantages de l'automatisation

1. **Cohérence** — Même viewport, même timing
2. **Reproductible** — Re-run après chaque update UI
3. **Rapide** — 66 screenshots en 10 minutes
4. **Multi-device** — Desktop + Tablet + Mobile automatique
5. **CI/CD ready** — Peut tourner dans la pipeline

---

**À lancer après le Big Bang, quand l'UI est finalisée.**
