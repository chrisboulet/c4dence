# Guide Administrateur C4DENCE

> Guide de configuration et gestion de votre organisation

---

## Rôles et permissions

C4DENCE utilise trois niveaux de rôles :

| Rôle | Permissions |
|------|-------------|
| **Propriétaire** (Owner) | Accès complet, peut supprimer l'organisation, transférer la propriété |
| **Administrateur** (Admin) | Gérer les membres, créer/modifier les WIGs, configurer les paramètres |
| **Membre** (Member) | Voir les données, saisir ses Lead Measures, prendre des engagements |

### Tableau des permissions détaillé

| Action | Propriétaire | Admin | Membre |
|--------|:------------:|:-----:|:------:|
| Voir le tableau de bord | ✅ | ✅ | ✅ |
| Saisir des données Lead Measures | ✅ | ✅ | ✅ |
| Prendre des engagements | ✅ | ✅ | ✅ |
| Créer un WIG | ✅ | ✅ | ❌ |
| Modifier un WIG | ✅ | ✅ | ❌ |
| Supprimer un WIG | ✅ | ✅ | ❌ |
| Inviter des membres | ✅ | ✅ | ❌ |
| Retirer des membres | ✅ | ❌ | ❌ |
| Modifier les rôles | ✅ | ❌ | ❌ |
| Modifier les paramètres org | ✅ | ✅ | ❌ |
| Supprimer l'organisation | ✅ | ❌ | ❌ |

---

## Gestion de l'organisation

### Modifier les informations

1. Accédez à **Paramètres** depuis le menu
2. Dans la section **Organisation**, vous pouvez modifier :
   - Le nom de l'organisation
   - Le logo (à venir)
3. Cliquez sur **Enregistrer**

![Paramètres](images/18-settings-desktop.png)

### Configurer le jour et l'heure de cadence

Pour rappeler à votre équipe le moment de la réunion hebdomadaire :

1. Allez dans **Paramètres**
2. Section **Cadence**
3. Sélectionnez :
   - **Jour** : Lundi, Mardi, etc.
   - **Heure** : 09:00, 14:00, etc.
4. L'équipe verra ce rappel sur la page Cadence

**Recommandations :**
- Choisissez un moment où **tout le monde** est disponible
- Début de semaine (lundi/mardi) permet d'agir sur la semaine
- Évitez le vendredi après-midi

---

## Gestion des membres

### Inviter un nouveau membre

1. Allez dans **Membres** depuis le menu principal
2. Cliquez sur **+ Inviter un membre**
3. Entrez l'**adresse email** du collègue
4. Sélectionnez le **rôle** :
   - **Membre** : Pour les contributeurs
   - **Administrateur** : Pour les co-gestionnaires
5. Cliquez sur **Envoyer l'invitation**

L'invité reçoit un email avec un lien pour rejoindre l'organisation.

**Note** : L'invitation expire après **7 jours**. Si le délai est dépassé, vous devrez renvoyer une nouvelle invitation.

### Modifier les rôles

*Disponible uniquement pour les Propriétaires*

1. Dans **Membres**, trouvez le membre concerné
2. Cliquez sur le menu **⋯** (trois points)
3. Sélectionnez **Modifier le rôle**
4. Choisissez le nouveau rôle
5. Confirmez le changement

### Retirer un membre

*Disponible uniquement pour les Propriétaires*

1. Dans **Membres**, trouvez le membre à retirer
2. Cliquez sur le menu **⋯**
3. Sélectionnez **Retirer de l'organisation**
4. Confirmez la suppression

**Attention** : Cette action est irréversible. Le membre devra être réinvité s'il doit revenir.

### Gérer les invitations en attente

Vous pouvez voir et annuler les invitations non acceptées :

1. Dans **Membres**, section **Invitations en attente**
2. Voyez les emails invités et leur date d'expiration
3. Cliquez sur **Annuler** pour révoquer une invitation

---

## Gestion des WIGs

### Créer un WIG efficace

En tant qu'Admin/Owner, vous pouvez créer des WIGs :

1. Depuis le **Dashboard**, cliquez sur **+ Nouveau WIG**
2. Remplissez les champs :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom** | Titre court et clair | "Augmenter les ventes B2B" |
| **Description** | Contexte et détails (optionnel) | "Focus sur le segment PME" |
| **Valeur de départ** | Où vous êtes aujourd'hui | 2,500,000 |
| **Valeur cible** | Où vous voulez aller | 3,200,000 |
| **Unité** | Type de mesure | $ |
| **Date de début** | Début du suivi | 01/01/2025 |
| **Date de fin** | Échéance | 31/03/2026 |
| **Responsable** | Membre accountable | Marie Dupont |

3. Cliquez sur **Créer**

### Modifier un WIG

1. Ouvrez le WIG depuis le dashboard ou la liste WIGs
2. Cliquez sur **Modifier** (icône crayon)
3. Ajustez les valeurs nécessaires
4. Sauvegardez

**Cas d'usage :**
- Correction d'une erreur de saisie
- Ajustement de la cible (en équipe!)
- Changement de responsable

### Archiver un WIG terminé

Quand un WIG est atteint ou abandonné :

1. Ouvrez le WIG
2. Mettez le statut à **Atteint** ou modifiez selon le contexte
3. Le WIG reste visible dans l'historique

**Recommandation** : Célébrez les WIGs atteints avec votre équipe!

### Supprimer un WIG

*À utiliser avec précaution*

La suppression est définitive et efface toutes les données associées :
- Lead Measures
- Données hebdomadaires
- Historique de progression

Pour supprimer :
1. Ouvrez le WIG
2. Menu **⋯** → **Supprimer**
3. Confirmez la suppression

---

## Gestion des Lead Measures

### Ajouter une Lead Measure à un WIG

1. Ouvrez le détail d'un WIG
2. Section **Mesures prédictives**
3. Cliquez sur **+ Ajouter**
4. Configurez :

| Champ | Description |
|-------|-------------|
| **Nom** | Action mesurée |
| **Cible hebdomadaire** | Objectif par semaine |
| **Unité** | Type de mesure |
| **Responsable** | Qui exécute cette action |

### Bonnes pratiques

- **2-3 Lead Measures maximum** par WIG
- Chaque Lead Measure devrait être **assignée à quelqu'un**
- La cible doit être **atteignable mais ambitieuse**

---

## Bonnes pratiques administrateur

### Préparer le lancement avec l'équipe

Avant de démarrer C4DENCE avec votre équipe :

1. **Définissez vos WIGs ensemble** — L'adhésion vient de la co-création
2. **Formez sur la méthodologie 4DX** — Utilisez le Guide Méthodologie
3. **Planifiez la première cadence** — Fixez un créneau récurrent
4. **Assignez les responsabilités** — Chaque Lead Measure a un propriétaire

### Former les nouveaux membres

Quand un nouveau membre rejoint :

1. Partagez le **Guide Utilisateur**
2. Expliquez le contexte des WIGs en cours
3. Assignez-lui une Lead Measure si pertinent
4. Incluez-le dès la prochaine cadence

### Maintenir la discipline sur le long terme

Le plus grand défi n'est pas de démarrer, mais de **maintenir l'effort** :

| Défi | Solution |
|------|----------|
| Les réunions sont annulées | Bloquez le créneau dans tous les agendas, c'est sacré |
| Les données ne sont pas saisies | Rappelez avant la cadence, célébrez ceux qui saisissent |
| Les engagements sont vagues | Exigez le format "Je vais [action spécifique]" |
| L'équipe perd l'intérêt | Montrez les progrès, célébrez les victoires |

### Checklist hebdomadaire admin

Avant chaque réunion de cadence :

- [ ] Vérifier que les Lead Measures sont à jour
- [ ] Préparer le scoreboard (automatique dans C4DENCE)
- [ ] Identifier les blocages potentiels
- [ ] Préparer 1-2 questions de coaching si nécessaire

---

## Dépannage

### Un membre n'arrive pas à se connecter

**Vérifiez :**
1. L'invitation a-t-elle été acceptée?
2. L'email utilisé est-il le même que celui de l'invitation?
3. Le compte Google fonctionne-t-il?

**Solution :**
- Annulez l'ancienne invitation
- Renvoyez une nouvelle invitation à la bonne adresse

### Les données ne se synchronisent pas

**Vérifiez :**
1. La connexion internet
2. Essayez de rafraîchir la page (F5)
3. Déconnectez-vous et reconnectez-vous

**Si le problème persiste :**
- Contactez le support : support@bouletstrategies.ca

### Un membre ne voit pas le bon WIG

**Vérifiez :**
1. Le membre est bien dans la bonne organisation
2. Le WIG n'a pas été supprimé
3. Les filtres ne cachent pas le WIG

### Questions fréquentes des admins

**Q : Puis-je avoir plusieurs Propriétaires?**
R : Oui, un Propriétaire peut promouvoir d'autres membres en Propriétaire.

**Q : Que se passe-t-il si je supprime mon compte?**
R : Si vous êtes le seul Propriétaire, vous devrez d'abord transférer la propriété à quelqu'un d'autre.

**Q : Les données sont-elles exportables?**
R : Cette fonctionnalité est prévue pour une version future.

**Q : Puis-je avoir plusieurs organisations?**
R : Oui, vous pouvez être membre de plusieurs organisations et naviguer entre elles.

---

## Sécurité et confidentialité

### Accès aux données

- Les données sont **isolées par organisation**
- Seuls les membres de votre organisation voient vos données
- La connexion utilise **Google OAuth** (pas de mot de passe stocké)

### Bonnes pratiques sécurité

1. **Retirez les membres** qui quittent l'entreprise
2. **Limitez les Admins** à ceux qui en ont vraiment besoin
3. **Vérifiez régulièrement** la liste des membres

---

## Support

### Contact

Pour toute question ou problème :

**Email** : support@bouletstrategies.ca
**Réponse** : Sous 24h ouvrables

### Demandes de fonctionnalités

Vos suggestions sont les bienvenues! Envoyez vos idées à :
christian@bouletstrategies.ca

---

*C4DENCE — Propulsé par Boulet Stratégies TI*
