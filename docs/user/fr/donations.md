# Dons & Paiements

Cette section couvre la manière dont les dons sont traités, suivis et comment configurer les fournisseurs de paiement.

## Tableau de Bord des Dons

L'onglet **Dons** de votre événement fournit une liste complète de toutes les transactions.

- **Statut** : Voir si un don a réussi, échoué ou a été remboursé.

### Vue Tableau

Le tableau des dons fournit un détail complet de chaque transaction :

- **Date** : Quand le don a eu lieu (survolez pour le temps relatif).
- **Donateur** : Nom et email du contributeur.
- **Montant** : Valeur et méthode de paiement utilisée.
- **Statut** : État actuel du traitement.
- **Actions** :
    - **Éditer** : Mettre à jour les détails du donateur (ex: corriger une coquille dans le nom).
    - **Télécharger le Reçu** : Générer un reçu PDF individuel.
    - **Annuler/Rembourser** : Rembourser le paiement (si supporté) et marquer comme annulé.

![Tableau des Dons & Exports](../assets/donation_table_export.png)

## Reçus & Exports

La plateforme génère automatiquement des reçus fiscaux PDF pour chaque don réussi. Ces documents sont créés dynamiquement en utilisant vos **Paramètres de Marque Globaux** (logo, nom légal, signature).

### Génération de PDF

- **Email Automatique** : Les reçus sont joints à l'email de confirmation envoyé au donateur immédiatement après le paiement.
- **Téléchargement Manuel** :
    1.  Localisez le don dans le tableau.
    2.  Cliquez sur le bouton **Actions** (trois points).
    3.  Sélectionnez **Télécharger le Reçu**.

### Export CSV & PDF en Masse

Pour la comptabilité, vous pouvez exporter les données depuis le Tableau de Bord de l'Événement :

1.  **Export CSV** : Télécharge une feuille de calcul de toutes les transactions correspondant à vos filtres actuels.
2.  **Export PDF (ZIP)** : Génère une archive ZIP contenant les reçus PDF individuels pour tous les dons réussis. Utile pour l'audit ou l'archivage hors ligne.

## Fournisseurs de Paiement

Pour accepter les paiements en ligne, vous devez configurer un processeur de paiement. Cela se fait dans les **Paramètres Globaux**.

[Voir le Guide des Paramètres de Paiement Globaux](global_settings.md#5-paiements)

> [!WARNING]
> Assurez-vous que vos clés de paiement sont pour l'environnement de **Production** lors d'un événement réel. Les clés de test ne doivent être utilisées que lors de la configuration.

## Guide du Flux de Don

Voici le parcours standard que vos donateurs expérimenteront.

### 1. Informations Donateur

Les donateurs remplissent leurs coordonnées de base.

![Formulaire de Don](../assets/donation_form.png)

_Exemple de Données :_

- **Nom** : `Test Donor`
- **Email** : `donor@example.com`

### 2. Détails du Paiement

Les donateurs choisissent leur méthode de paiement et entrent leurs identifiants.

![Écran de Paiement](../assets/donation_payment.png)

_Carte de Crédit Test (Mode Stripe) :_

- **Carte** : `4242 4242 4242 4242`
- **Exp** : `10/30`
- **CVC** : `123`
