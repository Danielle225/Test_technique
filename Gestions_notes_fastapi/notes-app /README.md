#  Application de Gestion de Notes - Frontend Next.js

Une application moderne de gestion de notes développée avec Next.js 14, TypeScript et Tailwind CSS, conçue pour consommer une API FastAPI.

##  Fonctionnalités

###  Authentification
- Connexion/Déconnexion avec JWT
- Gestion automatique des tokens
- Redirection automatique en cas de token expiré
- Persistance sécurisée dans localStorage

###  Gestion des Notes
- Création, édition, suppression de notes
- Support complet du Markdown
- Système de visibilité (Privé, Partagé, Public)
- Filtrage par statut et recherche en temps réel
- Tags personnalisables

###  Système de Partage Avancé
- Partage avec des utilisateurs spécifiques par email
- Liens publics avec tokens sécurisés
- Gestion des permissions (lecture/écriture)
- Interface intuitive de partage

###  Interface Utilisateur
- Design moderne avec Radix UI et Tailwind CSS
- Interface responsive adaptée mobile/desktop
- Système de notifications toast personnalisé
- Gestion d'erreurs structurées avec messages français

###  Développement
- TypeScript strict avec types unifiés
- Gestion d'erreurs API robuste
- Architecture modulaire avec services
- Hooks personnalisés pour la logique métier

##  Technologies Utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants accessibles
- **React Markdown** - Rendu Markdown
- **Lucide React** - Icônes modernes
- **FastAPI Backend** - API REST avec JWT

##  Architecture

```
notes-app/
├── app/                    # Pages Next.js (App Router)
│   ├── dashboard/         # Tableau de bord principal
│   ├── login/            # Page de connexion
│   └── register/         # Page d'inscription
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI (Radix)
│   ├── NoteCard.tsx     # Carte de note
│   ├── NoteModal.tsx    # Modal de création/édition
│   ├── ShareModal.tsx   # Modal de partage
│   └── ...
├── contexts/            # Contextes React
│   ├── AuthContext.tsx  # Gestion de l'authentification
│   └── ToastContext.tsx # Système de notifications
├── hooks/              # Hooks personnalisés
│   └── useNotes.ts     # Gestion des notes
├── lib/               # Utilitaires et configuration
│   ├── http-client.ts # Client HTTP avec intercepteurs
│   ├── auth-storage.ts # Gestion sécurisée du localStorage
│   └── utils.ts       # Fonctions utilitaires
├── services/          # Services API
│   ├── auth.service.ts    # Service d'authentification
│   ├── notes.service.ts   # Service de gestion des notes
│   └── sharing.service.ts # Service de partage
└── types/            # Définitions TypeScript
    └── index.ts      # Types unifiés
```

## ⚡ Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend FastAPI fonctionnel sur `http://localhost:8000`

### Installation

1. **Cloner le projet**
```bash
git clone git clone https://github.com/Danielle225/Test_technique.git/Gestions_notes_fastapi

cd notes-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
Créer un fichier `.env.local` :
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

4. **Démarrer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

##  API Endpoints

### Authentification
- `POST /api/v1/auth/login` - Connexion utilisateur
- `POST /api/v1/auth/logout` - Déconnexion
- `POST /api/v1/auth/register` - Inscription
- `GET /api/v1/auth/me` - Profil utilisateur

### Notes
- `GET /api/v1/notes` - Liste des notes
- `POST /api/v1/notes` - Créer une note
- `GET /api/v1/notes/{id}` - Récupérer une note
- `PUT /api/v1/notes/{id}` - Mettre à jour une note
- `DELETE /api/v1/notes/{id}` - Supprimer une note

### Partage
- `POST /api/v1/notes/{id}/share/{email}` - Partager avec un utilisateur
- `DELETE /api/v1/notes/{id}/share/{email}` - Arrêter le partage
- `GET /api/v1/shared-with-me` - Notes partagées avec moi
- `POST /api/v1/notes/{id}/public-link` - Créer un lien public
- `DELETE /api/v1/notes/{id}/public-link` - Révoquer un lien public

## � Modèles de Données

### Note
```typescript
interface Note {
  id: string
  titre: string
  contenu: string
  visibilite: "prive" | "partage" | "public"
  tags: string[]
  utilisateur_id: string
  public_token?: string
  date_creation: string
  date_modification: string
}
```

### Utilisateur
```typescript
interface User {
  id: string
  email: string
}
```

##  Fonctionnalités Détaillées

### Gestion des Erreurs
- Extraction intelligente des messages d'erreur FastAPI
- Parsing automatique des réponses JSON stringifiées  
- Messages d'erreur contextuels en français
- Gestion spécifique par code d'erreur (ALREADY_SHARED, etc.)

### Système de Toast
- 4 types : `reussi`, `erreur`, `avertissement`, `info`
- Auto-suppression après délai
- Interface française intuitive
- Animations fluides

### Authentification Avancée
- Interception automatique des erreurs 401
- Redirection automatique vers /login
- Nettoyage sécurisé des données
- Gestion de la persistence entre sessions

## 🔧 Scripts Disponibles

```bash
npm run dev          # Mode développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
```

## 🚀 Déploiement

### Build de Production
```bash
npm run build
npm run start
```

### Variables d'Environnement
```bash
NEXT_PUBLIC_API_URL=https://votre-api.com/api/v1
```

##  Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

##  Notes de Développement

- L'application utilise le nouveau App Router de Next.js 14
- TypeScript strict activé pour une meilleure qualité de code
- Composants UI basés sur Radix pour l'accessibilité
- Architecture modulaire pour faciliter la maintenance
- Gestion d'erreurs robuste avec fallbacks appropriés


