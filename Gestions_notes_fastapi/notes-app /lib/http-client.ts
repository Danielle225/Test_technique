import type { ApiError } from "@/types"
import { API_CONFIG, DEFAULT_HEADERS } from "./config"
import { AuthStorage } from "./auth-storage"

class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultHeaders = DEFAULT_HEADERS
  }

  private redirectToLogin() {
    // Vérifier si nous sommes côté client
    if (typeof window !== "undefined") {
      console.log("🔄 Token expiré - Redirection vers la page de login")
      
      // Nettoyer les données d'authentification
      AuthStorage.clearAll()
      
      // Rediriger vers la page de login
      window.location.href = "/login"
    }
  }
  

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return AuthStorage.getToken()
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken()
    const headers = { ...this.defaultHeaders, ...customHeaders }

    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log('Using auth token:', token.substring(0, 20) + '...')
    } else {
      console.log('No auth token found')
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")
    let responseData: any = null
    
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json()
      } catch (error) {
        console.warn("Failed to parse JSON response:", error)
      }
    }

    if (!response.ok) {
      const errorMessage = responseData?.detail || 
                          responseData?.message || 
                          `Erreur HTTP ${response.status}: ${response.statusText}`
      
      const errorCode = responseData?.code || 
                       responseData?.error_code || 
                       `HTTP_${response.status}`

      // Gérer les erreurs d'authentification (token expiré)
      if (response.status === 401) {
        console.log("❌ Erreur 401 - Token d'authentification expiré ou invalide")
        this.redirectToLogin()
        
        // Créer une erreur spéciale pour les 401
        const authError: ApiError = {
          message: "Votre session a expiré. Veuillez vous reconnecter.",
          status: response.status,
          code: "AUTHENTICATION_EXPIRED",
          errors: responseData?.errors || responseData,
          response: {
            data: responseData,
            status: response.status,
            statusText: response.statusText
          },
          data: responseData?.data
        }
        throw authError
      }
      
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        code: errorCode,
        errors: responseData?.errors || responseData,
        response: {
          data: responseData,
          status: response.status,
          statusText: response.statusText
        },
        data: responseData?.data
      }

      
      throw apiError

    }

    if (response.status === 204) {
      return {} as T
    }

    return responseData || ({} as T)
  }

  async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(customHeaders),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
   

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    })

 

    return this.handleResponse<T>(response)
  }

  async postForm<T>(endpoint: string, formData: URLSearchParams | FormData, customHeaders?: Record<string, string>): Promise<T> {
    const headers = this.getHeaders(customHeaders)
    delete headers["Content-Type"]
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: headers,
      body: formData,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(customHeaders),
    })

    return this.handleResponse<T>(response)
  }
}

export const httpClient = new HttpClient()



