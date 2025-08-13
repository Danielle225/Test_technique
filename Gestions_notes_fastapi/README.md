# Gestions Notes – FastAPI & Next.js

## Présentation

Ce projet est une application de gestion de notes permettant aux utilisateurs de créer, modifier, partager et organiser des notes. Il est composé d’un backend en Python (FastAPI) et d’un frontend en React (Next.js).

---

## Fonctionnalités principales
- Authentification des utilisateurs
- Création, modification, suppression de notes
- Partage de notes entre utilisateurs
- Recherche et organisation par tags
- Interface utilisateur moderne et responsive

---

## Prérequis

- Python 3.10+
- Node.js 18+
- npm ou yarn

---

## Installation

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
```

#### Lancer le backend

```bash
uvicorn main:app --reload
```

L’API sera disponible sur `http://localhost:8000`.

---

### 2. Frontend (Next.js)

```bash
cd notes-app
npm install

```

#### Lancer le frontend

```bash
npm run dev

```

L’application sera accessible sur `http://localhost:3000`.

---

## Structure du projet

```
backend/
  ├── core/           # Auth, permissions, exceptions
  ├── database/       # Connexion et gestion de la base
  ├── models/         # Modèles SQLAlchemy
  ├── repositories/   # Accès aux données
  ├── routers/        # Endpoints FastAPI
  ├── schemas/        # Schémas Pydantic
  ├── services/       # Logique métier
  ├── utils/          # Utilitaires
  └── main.py         # Point d’entrée API
notes-app/
  ├── app/            # Pages Next.js
  ├── components/     # Composants React
  ├── contexts/       # Contexts React
  ├── hooks/          # Hooks personnalisés
  ├── lib/            # Fonctions utilitaires
  ├── services/       # Appels API
  └── types/          # Types TypeScript
```

---

## Auteurs
- Danielle225

## Licence
Ce projet est sous licence MIT.
