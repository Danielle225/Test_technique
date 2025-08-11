// Gestion du stockage des tokens d'authentification
export class AuthStorage {
  private static readonly TOKEN_KEY = "auth_token"
  private static readonly REFRESH_TOKEN_KEY = "refresh_token"
  private static readonly USER_KEY = "user_data"

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }
    return null
  }

  static setUser(user: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static getUser(): any | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  static clearAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static hasValidToken(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      // Vérifier si le token JWT n'est pas expiré (optionnel)
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }
}
