import { AuthStorage } from "./auth-storage"

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", 
  ENDPOINTS: {
    // Authentification  
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout", 
    ME: "/auth/me", 

    // Notes
    NOTES: "/notes/notes/",
    NOTE_BY_ID: (id: string) => `/notes/notes/${id}`,
    SEARCH_NOTES: "/notes/notes/search/",
    SEARCH_BY_TAG: "/search/tags",
    
    // Partage
    SHARE_NOTE: (note_id: string, user_email: string) => `/sharing/${note_id}/share/${user_email}`,
    UNSHARE_NOTE: (note_id: string, user_email: string) => `/sharing/${note_id}/share/${user_email}`,
    SHARED_WITH_ME: "/shared-with-me",
    NOTE_SHARES: (note_id: string) => `/notes/${note_id}/shared-with`,
    CREATE_PUBLIC_LINK: (note_id: string) => `/sharing/notes/${note_id}/public-link`,
    REVOKE_PUBLIC_LINK: (note_id: string) => `/sharing/notes/${note_id}/public-link`,
    PUBLIC_NOTE: (token: string) => `/public/${token}`,
  },

  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${AuthStorage.getToken()}`,
  Accept: "application/json",

}

export const SIMPLE_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
}
