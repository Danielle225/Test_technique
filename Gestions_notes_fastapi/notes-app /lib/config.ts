// Configuration de l'API - Modifiez ces valeurs selon votre backend
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  ENDPOINTS: {
    // Authentification
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",

    // Notes
    NOTES: "/notes",
    NOTE_BY_ID: (id: string) => `/notes/${id}`,
  },

  // Configuration des timeouts et retry
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

// Headers par défaut
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
}
