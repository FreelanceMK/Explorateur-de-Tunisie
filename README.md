# 🇹🇳 Explorateur de Tunisie

Une **application web Progressive (PWA)** pour explorer les lieux en Tunisie. Découvrez des cafés, restaurants, hôtels, fast-foods et boucheries à travers les 24 gouvernorats tunisiens.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

---

## 📋 Table des matières

- [Stack Technique](#-stack-technique)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Scripts Disponibles](#-scripts-disponibles)
- [API Endpoints](#-api-endpoints)
- [Structure des Données](#-structure-des-données)
- [Catégories et Gouvernorats](#-catégories-et-gouvernorats)

---

## 🛠 Stack Technique

| Technologie | Usage |
|------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **React 19** | Interface utilisateur |
| **TypeScript** | Typage statique |
| **Prisma** | ORM pour la base de données |
| **MongoDB** | Base de données NoSQL |
| **Tailwind CSS 4** | Styling avec composants Radix UI |
| **Shadcn/UI** | Composants UI (Button, Dialog, Card, etc.) |
| **PWA** | Application installable sur mobile |

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Système de connexion sécurisé
- Session stockée en localStorage avec durée de 30 jours
- Option "Se souvenir de moi"
- Route protégée qui redirige vers `/login` si non connecté

### 📍 Gestion des Lieux (Places)
Chaque lieu contient :
- **Titre**, **Adresse**, **Catégorie**, **Gouvernorat**
- **Coordonnées GPS** (latitude/longitude)
- **Note** (rating 0-5 étoiles), **Nombre d'avis**
- **Téléphone**, **Site web** (optionnels)
- **Horaires d'ouverture**, **Gamme de prix**
- **Image** (thumbnailUrl)
- Identifiants Google Maps (placeId, cid, fid)

### 🔍 Filtres et Recherche
- Recherche textuelle (titre, adresse)
- Filtres par **catégorie** (Café, Restaurant, Fast-food, Hotel, Boucherie)
- Filtres par **gouvernorat** (24 gouvernorats tunisiens)
- Filtres par **note** (min/max)
- Filtres par **nombre d'avis** (min/max)
- Options : "A un téléphone", "A un site web"
- Tri par note, avis, titre

### 📊 Affichage
- **Vue tableau** : Liste détaillée avec colonnes
- **Vue grille** : Cartes visuelles avec images
- **Pagination** : Configurable (nombre d'éléments par page)
- **Modal de détails** : Affiche toutes les infos d'un lieu + carte Google Maps intégrée

### 👑 Mode Admin
*(Activation secrète : 3 clics sur "Filters")*
- **Créer** un nouveau lieu
- **Modifier** un lieu existant
- **Supprimer** un lieu
- Interface CRUD complète avec modales de formulaire

### 📈 Statistiques
- Nombre total de lieux
- Répartition par catégorie et gouvernorat
- Distribution des notes
- Statistiques de contact (% avec téléphone/site web)
- Note moyenne, nombre d'avis moyen

### 📱 PWA (Progressive Web App)
- Installable sur mobile (Android et iOS)
- Manifest.json configuré
- Service Worker pour le cache
- Prompt d'installation personnalisé
- Instructions spécifiques pour iOS

### 🌙 Thème
- Support du thème sombre/clair
- Thème sombre par défaut

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- pnpm ou npm

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/FreelanceMK/Explorateur-de-Tunisie.git
cd Explorateur-de-Tunisie
```

2. **Installer les dépendances**
```bash
npm install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine :
```env
MONGODB_URI=mongodb+srv://your-connection-string
```

4. **Générer le client Prisma**
```bash
npm run prisma:generate
```

5. **Importer les données (optionnel)**
```bash
npm run db:import
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer en développement |
| `npm run build` | Build production |
| `npm run start` | Lancer en production |
| `npm run lint` | Vérifier le code |
| `npm run db:import` | Importer les données depuis `data.json` |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:studio` | Interface Prisma pour la DB |

---

## 🔌 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/places` | GET | Liste paginée avec filtres |
| `/api/places` | POST | Créer un lieu |
| `/api/places/[id]` | GET | Détails d'un lieu |
| `/api/places/[id]` | PATCH | Modifier un lieu |
| `/api/places/[id]` | DELETE | Supprimer un lieu |
| `/api/places/stats` | GET | Statistiques globales |

---

## 📦 Structure des Données

```prisma
model Place {
  id            String   @id
  title         String
  address       String
  category      String
  governorate   String
  latitude      Float
  longitude     Float
  rating        Float
  reviews       Int
  position      Int
  phoneNumber   String?
  website       String?
  cid           String?
  placeId       String?
  openingHours  Json?
  priceRange    String?
  thumbnailUrl  String?
  types         String[]
  ratingCount   Int?
  fid           String?
  createdAt     DateTime
  updatedAt     DateTime
}
```

---

## 🏷 Catégories et Gouvernorats

### 5 Catégories
| Icône | Catégorie |
|-------|-----------|
| ☕ | Café |
| 🍽️ | Restaurant |
| 🍔 | Restauration rapide |
| 🏨 | Hotel |
| 🥩 | Boucherie |

### 24 Gouvernorats Tunisiens
Tunis, Ariana, Ben Arous, Manouba, Nabeul, Zaghouan, Bizerte, Beja, Jendouba, Kef, Siliana, Sousse, Monastir, Mahdia, Sfax, Kairouan, Kasserine, Sidi Bouzid, Gabes, Mednine, Tataouine, Gafsa, Tozeur, Kebili

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 👥 Auteurs

- **FreelanceMK** - [GitHub](https://github.com/FreelanceMK)
