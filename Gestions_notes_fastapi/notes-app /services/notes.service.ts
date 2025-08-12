import type { Note } from "@/types"
import { httpClient } from "@/lib/http-client"
import { API_CONFIG } from "@/lib/config"

export class NotesService {
  static async getAllNotes(): Promise<Note[]> {
    return httpClient.get<Note[]>(API_CONFIG.ENDPOINTS.NOTES)
  }

  static async getNoteById(id: string): Promise<Note> {
    return httpClient.get<Note>(API_CONFIG.ENDPOINTS.NOTE_BY_ID(id))
  }

  static async createNote(noteData: Omit<Note, "id" | "date_creation" | "date_modification" | "utilisateur_id">): Promise<Note> {
    return httpClient.post<Note>(API_CONFIG.ENDPOINTS.NOTES, {
      titre: noteData.titre,
      contenu: noteData.contenu,
      visibilite: noteData.visibilite,
      tags: noteData.tags,
    })
  }

  static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    return httpClient.put<Note>(API_CONFIG.ENDPOINTS.NOTE_BY_ID(id), {
      titre: updates.titre,
      contenu: updates.contenu,
      visibilite: updates.visibilite,
      tags: updates.tags ? updates.tags.map(tag => tag.nom) : updates.tags, 
    })
  }

  static async deleteNote(id: string): Promise<void> {
    await httpClient.delete(API_CONFIG.ENDPOINTS.NOTE_BY_ID(id))
  }

  static async searchNotes(query: string, skip = 0, limit = 10): Promise<Note[]> {
    return httpClient.get<Note[]>(`${API_CONFIG.ENDPOINTS.SEARCH_NOTES}?query=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`)
  }

  static async searchByTag(tag: string): Promise<Note[]> {
    return httpClient.get<Note[]>(`${API_CONFIG.ENDPOINTS.SEARCH_BY_TAG}?tag=${encodeURIComponent(tag)}`)
  }
}
