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
    
    // Essayer de parser le JSON si possible
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json()
        console.log("📄 Response Data:", responseData)
      } catch (error) {
        console.warn("Failed to parse JSON response:", error)
      }
    }

    if (!response.ok) {
      // Structure d'erreur FastAPI standard
      const errorMessage = responseData?.detail || 
                          responseData?.message || 
                          `Erreur HTTP ${response.status}: ${response.statusText}`
      
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        errors: responseData?.errors || responseData,
        response: {
          data: responseData,
          status: response.status,
          statusText: response.statusText
        }
      }

      console.error("❌ API Error:", apiError)
      // Note: Toast notifications should be handled in the components that use the API
      throw apiError

    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    // Retourner les données si elles existent, sinon un objet vide
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
    // Debug logging
    console.log("🌐 POST Request:", {
      url: `${this.baseURL}${endpoint}`,
      data: data,
      headers: this.getHeaders(customHeaders)
    })

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    })

    // Debug response
    console.log("📥 Response:", {
      status: response.status,
      message: response.statusText,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    return this.handleResponse<T>(response)
  }

  async postForm<T>(endpoint: string, formData: URLSearchParams | FormData, customHeaders?: Record<string, string>): Promise<T> {
    // Pour form data, ne pas inclure Content-Type (let fetch set it automatically)
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



