import type { Note } from "@/types"
import { httpClient } from "@/lib/http-client"
import { API_CONFIG } from "@/lib/config"

export interface ShareResult {
  message: string
  success: boolean
}

export interface PublicLinkResult {
  public_token: string
  public_url: string
  message: string
}

export interface NoteShare {
  user_email: string
  shared_at: string
}

export class SharingService {
  // Partager une note avec un utilisateur
  static async shareNoteWithUser(noteId: string, userEmail: string): Promise<ShareResult> {
    const endpoint = API_CONFIG.ENDPOINTS.SHARE_NOTE(noteId, userEmail)
    console.log('Sharing endpoint:', endpoint)
    console.log('Full URL:', API_CONFIG.BASE_URL + endpoint)
    return httpClient.post<ShareResult>(endpoint)
  }

  // Arrêter le partage d'une note avec un utilisateur
  static async unshareNoteWithUser(noteId: string, userEmail: string): Promise<ShareResult> {
    return httpClient.delete<ShareResult>(API_CONFIG.ENDPOINTS.UNSHARE_NOTE(noteId, userEmail))
  }

  // Récupérer les notes partagées avec moi
  static async getSharedWithMe(skip = 0, limit = 20): Promise<Note[]> {
    return httpClient.get<Note[]>(`${API_CONFIG.ENDPOINTS.SHARED_WITH_ME}?skip=${skip}&limit=${limit}`)
  }

  // Voir avec qui une note est partagée
  static async getNoteShares(noteId: string): Promise<NoteShare[]> {
    return httpClient.get<NoteShare[]>(API_CONFIG.ENDPOINTS.NOTE_SHARES(noteId))
  }

  // Créer un lien public pour une note
  static async createPublicLink(noteId: string): Promise<PublicLinkResult> {
    return httpClient.post<PublicLinkResult>(API_CONFIG.ENDPOINTS.CREATE_PUBLIC_LINK(noteId))
  }

  // Révoquer le lien public d'une note
  static async revokePublicLink(noteId: string): Promise<ShareResult> {
    return httpClient.delete<ShareResult>(API_CONFIG.ENDPOINTS.REVOKE_PUBLIC_LINK(noteId))
  }

  // Accéder à une note publique via son token
  static async getPublicNote(token: string): Promise<Note> {
    return httpClient.get<Note>(API_CONFIG.ENDPOINTS.PUBLIC_NOTE(token))
  }
}
