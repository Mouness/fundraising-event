# Paramètres Globaux

La zone **Paramètres Globaux** vous permet de configurer les défauts de l'organisation qui s'appliquent à tous vos événements. Cela agit comme votre **Centre de Marque**, assurant une cohérence et vous faisant gagner du temps lors de la création de nouvelles campagnes.

Pour accéder à ces paramètres, cliquez sur **Paramètres** dans la barre latérale principale.

## 1. Identité

Configurez le profil principal de votre organisation.

![Paramètres d'Identité](../assets/settings_identity.png)

- **Nom Légal** : Détermine le titre par défaut des nouveaux événements et le texte du pied de page.
- **URL Logo** : Le logo par défaut utilisé sur tous les événements.
- **Email Support** : Où les donateurs peuvent vous joindre.
- **Site Web** : Votre site web organisationnel principal.

## 2. Communication

Paramètres liés aux emails automatisés et aux reçus.

![Paramètres de Communication](../assets/settings_communication.png)

- **Nom de l'Expéditeur** : Le nom que les donateurs verront dans leur boîte mail (ex: "Équipe Ocean Cleanup").
- **Signature** : Texte ajouté au bas de tous les emails.
- **Reçus PDF** : Activer ou désactiver l'envoi automatique des reçus fiscaux PDF en pièce jointe.

## 3. Thème & Design

Définissez la palette de couleurs par défaut.

![Paramètres de Thème](../assets/settings_theme.png)

- **Couleur Primaire** : Utilisée pour les boutons, les mises en avant et les interactions clés.
- **Couleur Secondaire** : Utilisée pour les arrière-plans ou les accents.
- **Variables Personnalisées** : Les utilisateurs avancés peuvent définir des variables CSS ici pour surcharger des tokens de design spécifiques. [Voir Guide Technique](../../technical/white-labeling.md#css-variables-reference) pour une liste complète.

## 4. Assets

Gérez les ressources médias globales.

![Paramètres des Assets](../assets/settings_assets.png)

- **Favicon** : La petite icône affichée dans l'onglet du navigateur.
- **Arrière-plans par Défaut** :
    - _Page Donateur_ : Image de repli pour les formulaires de don.
    - _Écran Live_ : Image de repli pour le tableau de bord en direct.

## 5. Paiements

Intégrez vos processeurs de paiement pour accepter les dons.

![Paramètres de Paiement](../assets/settings_payment.png)

- **Devise** : La devise par défaut pour tous les événements (ex: EUR, USD).
- **Stripe** : Cliquez pour configurer le traitement par carte bancaire. Nécessite `Clé Publique` et `Clé Secrète`.
- **PayPal** : Cliquez pour configurer les paiements PayPal. Nécessite `Client ID`.

## 6. Localisation

Gérez les paramètres de langue et régionaux.

![Paramètres de Localisation](../assets/settings_localization.png)

- **Langue par Défaut** : La langue que les utilisateurs voient lors de leur première visite (ex: Français).
- **Langues Supportées** : Cochez les langues que vous souhaitez proposer (Anglais, Français, etc.).
- **Surcharges (Overrides)** : Remplacez manuellement des chaînes de texte spécifiques pour n'importe quelle langue (ex: renommer "Staff" en "Bénévoles").
