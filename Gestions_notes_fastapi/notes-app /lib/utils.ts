import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utilitaire pour formater les erreurs de validation
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("\n")
}

// Utilitaire pour extraire les messages d'erreur de l'API
export function getApiErrorMessage(error: any, fallbackMessage: string = "Une erreur est survenue"): string {
  console.error('Erreur API complète:', error)
  
  // Si c'est une erreur structurée de notre HttpClient
  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }
  
  // FastAPI standard - detail direct
  if (error?.detail && typeof error.detail === 'string') {
    return error.detail
  }
  
  // Si c'est une erreur avec un message direct dans notre structure
  if (error?.message && typeof error.message === 'string') {
    return error.message
  }
  
  // Si c'est une erreur de validation FastAPI avec plusieurs champs
  if (error?.response?.data?.errors) {
    return formatValidationErrors(error.response.data.errors)
  }
  
  // Erreur de validation directe
  if (error?.errors && typeof error.errors === 'object') {
    return formatValidationErrors(error.errors)
  }
  
  // FastAPI validation errors format
  if (Array.isArray(error?.detail)) {
    return error.detail.map((item: any) => 
      `${item.loc?.join('.')}: ${item.msg}`
    ).join(', ')
  }
  
  return fallbackMessage
}

// Utilitaire pour extraire les messages de succès de l'API
export function getApiSuccessMessage(response: any, fallbackMessage: string = "Opération réussie"): string {
  console.log('Réponse API complète:', response)
  
  // Message de succès direct
  if (response?.message && typeof response.message === 'string') {
    return response.message
  }
  
  // Detail de succès
  if (response?.detail && typeof response.detail === 'string') {
    return response.detail
  }
  
  // Success field
  if (response?.success && typeof response.success === 'string') {
    return response.success
  }
  
  return fallbackMessage
}

// Utilitaire pour gérer les paramètres d'URL
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })

  return searchParams.toString()
}
