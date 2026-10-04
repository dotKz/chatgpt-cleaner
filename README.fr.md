<div align="center">

# ChatGPT Cleaner

**Un userscript léger et respectueux de la vie privée pour gérer les conversations ChatGPT en masse.**

Recherche, filtrage par projet, archivage, restauration et nettoyage de gros historiques depuis une interface compacte pensée pour s'intégrer naturellement à ChatGPT.

[![Version](https://img.shields.io/badge/version-1.0.0-10a37f?style=flat-square)](#changelog)
[![Userscript](https://img.shields.io/badge/userscript-Tampermonkey-111111?style=flat-square)](#installation)
[![Licence](https://img.shields.io/badge/licence-MIT-blue?style=flat-square)](LICENSE)

[Installer le userscript](https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js) · [Signaler un bug](https://github.com/dotKz/chatgpt-cleaner/issues/new?template=bug_report.yml) · [Proposer une fonctionnalité](https://github.com/dotKz/chatgpt-cleaner/issues/new?template=feature_request.yml)

[English](README.md) · **Français**

</div>

---

## Pourquoi ChatGPT Cleaner ?

Créer des conversations dans ChatGPT est simple. Faire le ménage dans plusieurs centaines de chats l'est beaucoup moins.

ChatGPT Cleaner ajoute un gestionnaire compact directement dans l'interface web de ChatGPT afin de parcourir rapidement l'historique, isoler les conversations de projets, retrouver les archives et appliquer des actions en masse.

## Fonctionnalités

- Interface **minimaliste inspirée de ChatGPT**.
- Vues **Actifs / Archives / Sélection**.
- Filtres **Tous les chats / Dans les projets / Hors projets**.
- Sélection d'un **projet précis** via un dropdown avec recherche.
- Recherche rapide par titre et projet.
- Tri par **plus récent, plus ancien, A → Z ou projet**.
- Sélection multiple avec vue de contrôle avant action.
- Archivage en masse.
- Restauration des conversations archivées.
- Suppression multiple avec confirmation intégrée.
- Ouverture directe d'une conversation avant de décider.
- Adaptation automatique au thème clair/sombre.
- Adaptation automatique à la langue de ChatGPT / du navigateur.
- **15 langues** incluses : anglais, français, espagnol, allemand, italien, portugais, néerlandais, polonais, turc, russe, japonais, coréen, chinois simplifié, chinois traditionnel et arabe.
- Rendu progressif, concurrence limitée et retries pour les gros historiques.
- Aucune dépendance externe, aucun tracking et aucune analytics.

## Installation

1. Installe **Tampermonkey** dans ton navigateur.
2. Ouvre le [userscript brut](https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js).
3. Confirme l'installation dans Tampermonkey.
4. Recharge [chatgpt.com](https://chatgpt.com/).
5. Ouvre **ChatGPT Cleaner** avec son bouton flottant.

### Installation manuelle

1. Ouvre Tampermonkey.
2. Crée un nouveau script.
3. Remplace son contenu par [`chatgpt-cleaner.user.js`](chatgpt-cleaner.user.js).
4. Sauvegarde puis recharge ChatGPT.

## Vie privée

Le script fonctionne directement dans ton navigateur sur les pages ChatGPT.

- Aucune donnée n'est envoyée à un serveur tiers.
- Aucun tracking ni outil d'analytics.
- Aucune librairie externe ou code distant.
- Le script utilise la session ChatGPT déjà ouverte pour appeler les endpoints web internes nécessaires à la gestion des conversations.
- Les listes et sélections restent uniquement en mémoire pendant la session de page et ne sont pas enregistrées dans le stockage local par le script.

## Avertissement

> ChatGPT Cleaner est un **projet communautaire non officiel**. Il n'est ni affilié, ni approuvé, ni maintenu par OpenAI.

Le script s'appuie sur des **API web internes non documentées de ChatGPT**. Leur structure peut changer sans préavis et casser temporairement certaines fonctions.

Vérifie toujours ta sélection avant une action en masse.

## Changelog

### v1.0.0

Première version publique :

- gestionnaire compact façon ChatGPT ;
- vues actifs, archives et sélection ;
- filtres projets et dropdown de projet ;
- recherche et tris ;
- archivage, restauration et suppression en masse ;
- thème et langue automatiques ;
- 15 langues ;
- optimisations pour les gros historiques.

## Auteur

Créé par **dotKz**.

- Discord : **kz.kz**
- Support / bugs : [GitHub Issues](https://github.com/dotKz/chatgpt-cleaner/issues)

## Licence

Distribué sous licence [MIT](LICENSE).
