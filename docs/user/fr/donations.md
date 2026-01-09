# Dons & Paiements

Cette section couvre la manière dont les dons sont traités, suivis et comment configurer les fournisseurs de paiement.

## Tableau de Bord des Dons

L'onglet **Dons** de votre événement fournit une liste complète de toutes les transactions.

- **Statut** : Voir si un don a réussi, échoué ou a été remboursé.
- **Reçus** : Télécharger manuellement les reçus PDF si un donateur le demande.
- **Export** : Exporter les données donateurs pour des rapports externes.

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
