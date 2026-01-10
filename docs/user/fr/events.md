# Gestion des Événements

Le cœur de la plateforme est la capacité de créer et gérer des campagnes de collecte de fonds distinctes.

## Créer un Événement

1.  Accédez à l'onglet **Événements** dans le menu latéral.
2.  Cliquez sur le bouton **+ Nouvel Événement**.
3.  Remplissez les détails essentiels :
    - **Nom** : Le titre public de votre événement (ex: "Gala d'Hiver 2025").
    - **Slug** : L'URL conviviale (ex: `gala-hiver-2025`).
    - **Objectif** : Le montant cible à atteindre.

![Liste des Événements](../assets/event_list.png)

## Tableau de Bord de l'Événement

Chaque événement possède son propre tableau de bord dédié. Ici, vous pouvez suivre les dons spécifiques, gérer les paramètres et voir les performances en temps réel.

![Tableau de Bord Événement](../assets/event_dashboard.png)

## Paramètres de l'Événement

Dans l'onglet **Paramètres** d'un événement, vous pouvez configurer les éléments suivants :

### Détails de Base

![Paramètres Généraux Événement](../assets/event_settings_general.png)

- **Description** : Un court résumé de l'événement (optimisé SEO).
- **Date** : La date prévue de l'événement.
- **Statut** :
    - `Brouillon` : Visible uniquement par les admins.
    - `Actif` : Accessible publiquement et accepte les dons.
    - `Fermé` : Visible mais les dons sont désactivés.

### Configuration du Formulaire

Personnalisez les informations que vous collectez auprès des donateurs lors du processus de paiement.

![Configuration du Formulaire](../assets/event_settings_form.png)

Vous pouvez activer/désactiver :

- **Numéro de Téléphone**
- **Adresse Postale**
- **Nom de l'Entreprise**
- **Message** (Permettre aux donateurs de laisser un commentaire)
- **Dons Anonymes** (Permettre aux donateurs de masquer leur nom des flux publics)

> Garder le formulaire court augmente le taux de conversion. Activez uniquement les champs dont vous avez strictement besoin.

## Équipe de l'Événement et Affectation du Personnel

Vous pouvez affecter des membres de votre **Pool Global de Personnel** pour travailler sur des événements spécifiques. Les membres affectés peuvent accéder à l'**App Collecteur** pour cet événement en utilisant leur code PIN.

1.  Accédez à l'onglet **Équipe** dans le Tableau de Bord de l'Événement.
2.  **Assigner un Membre** : Sélectionnez un bénévole dans la liste déroulante.
3.  **Confirmer** : Le membre est maintenant autorisé à collecter des dons pour cet événement.

![Affectation du Personnel](../assets/event_staff_assignment.png)

> [!NOTE]
> Seuls les membres déjà ajoutés au Pool Global de Personnel (via l'onglet principal Personnel) apparaîtront dans la liste. Pour ajouter de nouveaux bénévoles, voir [Gestion du Personnel](staff.md).
