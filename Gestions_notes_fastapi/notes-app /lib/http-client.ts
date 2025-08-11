import type { ApiError } from "@/types"
import { API_CONFIG, DEFAULT_HEADERS } from "./config"

class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultHeaders = DEFAULT_HEADERS
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken()
    const headers = { ...this.defaultHeaders, ...customHeaders }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any

      try {
        errorData = await response.json()
      } catch {
        errorData = { message: "Une erreur est survenue" }
      }

      const apiError: ApiError = {
        message: errorData.message || `Erreur ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      }

      throw apiError
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    try {
      return await response.json()
    } catch {
      return {} as T
    }
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
