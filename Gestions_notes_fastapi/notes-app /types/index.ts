// Types pour l'authentification
export interface User {
  id: string
  email: string
}

export interface RegisterData {
  email: string
  mot_de_passe: string
}

export interface LoginData {
  email: string
  mot_de_passe: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}
export interface Tag {
  id: string
  nom: string
}

// Types pour les notes
export interface Note {
  id: string
  titre: string
  contenu: string
  visibilite: "prive" | "partage" | "public"
  tags: Tag[]
  utilisateur_id: string
  public_token?: string
  date_creation: string
  date_modification: string
}

export interface NotesFilters {
  search: string
  visibilite: "all" | "prive" | "partage" | "public"
  tags: Tag[]
}

// Types pour les erreurs API
export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
  response?: {
    data: any
    status: number
    statusText: string
  }
}

// Types pour les toasts
export interface Toast {
  id?: string
  type: "reussi" | "erreur" | "avertissement" | "info"
  message: string
  duration?: number
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}
