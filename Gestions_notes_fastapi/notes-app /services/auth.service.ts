import type { User, LoginResponse } from "@/types"
import { httpClient } from "@/lib/http-client"
import { API_CONFIG } from "@/lib/config"
import { AuthStorage } from "@/lib/auth-storage"

export class AuthService {
  static async register(userData: {
    email: string
    mot_de_passe: string
  }): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(API_CONFIG.ENDPOINTS.REGISTER, userData)
  }

  static async login(email: string, mot_de_passe: string): Promise<LoginResponse> {
    try {
      // Revenir au JSON car FastAPI l'attend probablement
      const response = await httpClient.post<any>(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        mot_de_passe,
      })

      // Stocker le token et les données utilisateur
      if (response.access_token) {
        AuthStorage.setToken(response.access_token)
      }
      
      if (response.refresh_token) {
        AuthStorage.setRefreshToken(response.refresh_token)
      }

      const user: User = {
        id: String(Date.now()),
        email: email,
      }
      
      // console.log("✅ Nouvel utilisateur créé:", user)
      AuthStorage.setUser(user)

      return {
        user,
        token: response.access_token,
        refreshToken: response.refresh_token,
      }
    } catch (error) {
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT)
    } catch (error) {
      console.warn("Erreur lors de la déconnexion côté serveur:", error)
    } finally {
      AuthStorage.clearAll()
    }
  }

 
}
