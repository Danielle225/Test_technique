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

export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("\n")
}

export function extractApiError(error: any): {
  status: string;
  code: string;
  message: string;
  data?: any;
} | null {
  console.error('Erreur API complète:', error)
  
  const parseIfString = (value: any) => {
    if (typeof value === 'string') {
      try {
        let normalizedJson = value
        
        normalizedJson = normalizedJson.replace(/'/g, '"')
        
        normalizedJson = normalizedJson.replace(/"message": "([^"]*)"([^"]*)"([^"]*)"/g, '"message": "$1\\"$2\\"$3"')
        
        normalizedJson = normalizedJson
          .replace(/True/g, 'true')
          .replace(/False/g, 'false')
          .replace(/None/g, 'null')
          
        return JSON.parse(normalizedJson)
      } catch {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
    }
    return value
  }

  if (error?.response?.data?.detail) {
    const detail = parseIfString(error.response.data.detail)
    if (detail && typeof detail === 'object' && detail.status && detail.code && detail.message) {
      return detail
    }
  }

  if (error?.detail) {
    const detail = parseIfString(error.detail)
    if (detail && typeof detail === 'object' && detail.status && detail.code && detail.message) {
      return detail
    }
  }

  if (error?.message) {
    const message = parseIfString(error.message)
    if (message && typeof message === 'object' && message.status && message.code && message.message) {
      return message
    }
  }

  return null
}

export function getApiErrorMessage(error: any, fallbackMessage: string = "Une erreur est survenue"): string {
  console.log(' Extraction du message d\'erreur depuis:', error)
  
  const structuredError = extractApiError(error)
  if (structuredError) {
    console.log('Message extrait de l\'erreur structurée:', structuredError.message)
    return structuredError.message
  }

  if (error?.response?.data?.detail && typeof error.response.data.detail === 'string') {
    if (error.response.data.detail.length < 200) {
      return error.response.data.detail
    }
  }

  if (error?.response?.data?.message && typeof error.response.data.message === 'string') {
    return error.response.data.message
  }

  if (error?.detail && typeof error.detail === 'string') {
    return error.detail
  }

  if (error?.message && typeof error.message === 'string') {
    return error.message
  }

  if (Array.isArray(error?.detail)) {
    return error.detail.map((item: any) => 
      `${item.loc?.join('.')}: ${item.msg}`
    ).join(', ')
  }

  if (error?.response?.data?.errors) {
    return formatValidationErrors(error.response.data.errors)
  }

  return fallbackMessage
}

export function getApiErrorCode(error: any): string | null {
  const structuredError = extractApiError(error)
  return structuredError?.code || null
}

export function getApiErrorData(error: any): any {
  const structuredError = extractApiError(error)
  return structuredError?.data || null
}

export function isStructuredApiError(error: any): boolean {
  return extractApiError(error) !== null
}

export function getApiSuccessMessage(response: any, fallbackMessage: string = "Opération réussie"): string {
  console.log('Réponse API complète:', response)
  
  if (response?.message && typeof response.message === 'string') {
    return response.message
  }
  
  if (response?.detail && typeof response.detail === 'string') {
    return response.detail
  }
  
  if (response?.success && typeof response.success === 'string') {
    return response.success
  }
  
  return fallbackMessage
}

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
