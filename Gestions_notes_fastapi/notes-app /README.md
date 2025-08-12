# Guide de Migration - Frontend pur pour API FastAPI

## ✅ Modifications effectuées

### 1. Suppression des API Routes Next.js
- Suppression complète du dossier `app/api`
- L'application est maintenant un frontend pur

### 2. Configuration des services
- **AuthService** (`services/auth.service.ts`) : Service pour l'authentification avec votre API FastAPI
- **NotesService** (`services/notes.service.ts`) : Service pour la gestion des notes
- **Types** (`types/index.ts`) : Types TypeScript adaptés à votre API

### 3. Configuration mise à jour
- **Configuration API** (`lib/config.ts`) : URL et endpoints adaptés à votre backend
- **Client HTTP** (`lib/http-client.ts`) : Gestion automatique des tokens JWT
- **Variables d'environnement** (`.env.local`) : Configuration de l'URL de l'API

### 4. Composants adaptés
- **NoteCard** : Utilise les bons noms de champs (titre, contenu, etc.)
- **NoteModal** : Adapté aux types de votre API
- **StatusTabs** : Status "done" au lieu de "completed"

## 🚀 Comment utiliser

### 1. Démarrer votre backend FastAPI
```bash
cd ../backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Démarrer le frontend Next.js
```bash
npm run dev
```

### 3. Configuration de l'API
L'application attend votre API sur `http://localhost:8000/api` par défaut.
Modifiez `.env.local` si nécessaire :
```bash
NEXT_PUBLIC_API_URL=http://votre-api:port/api
```

## 🔧 Endpoints attendus

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur actuel

### Notes
- `GET /api/notes` - Liste des notes
- `POST /api/notes` - Créer une note
- `GET /api/notes/{id}` - Récupérer une note
- `PUT /api/notes/{id}` - Mettre à jour une note
- `DELETE /api/notes/{id}` - Supprimer une note

### Partage (optionnel)
- `POST /api/notes/{id}/share/{email}` - Partager avec utilisateur
- `DELETE /api/notes/{id}/share/{email}` - Arrêter le partage
- `GET /api/shared-with-me` - Notes partagées avec moi
- `POST /api/notes/{id}/public-link` - Créer lien public
- `DELETE /api/notes/{id}/public-link` - Supprimer lien public

## 📝 Format des données

### Utilisateur
```typescript
{
  id: string
  email: string
  nom: string
  prenom?: string
  avatar?: string
}
```

### Note
```typescript
{
  id: string
  titre: string
  contenu: string
  status: "todo" | "in-progress" | "done"
  tags: string[]
  utilisateur_id: string
  is_public: boolean
  public_token?: string
  created_at: string
  updated_at: string
}
```

### Authentification
```typescript
// Réponse de login
{
  access_token: string
  refresh_token?: string
  token_type: "bearer"
}
```

## 🛠 Personnalisation

### Ajouter de nouveaux endpoints
1. Ajoutez l'endpoint dans `lib/config.ts`
2. Créez la méthode dans le service approprié
3. Utilisez le hook correspondant dans vos composants

### Modifier les types
1. Mettez à jour `types/index.ts`
2. Adaptez les services et composants si nécessaire

## 📱 Fonctionnalités

- ✅ Authentification avec JWT
- ✅ Gestion des notes (CRUD)
- ✅ Filtrage et recherche
- ✅ Rendu Markdown
- ✅ Système de tags
- ✅ Gestion des statuts
- ✅ Interface responsive
- ✅ Gestion d'erreurs et notifications
- 🔄 Partage de notes (prêt, à connecter avec votre API)
- 🔄 Liens publics (prêt, à connecter avec votre API)

L'application est maintenant prête à fonctionner avec votre backend FastAPI !
