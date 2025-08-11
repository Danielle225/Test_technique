"use client"

import { useCallback } from "react"
import type { ApiError } from "@/types"
import { useToast } from "@/contexts/ToastContext"
import { useAuth } from "@/contexts/AuthContext"

export function useApiError() {
  const { addToast } = useToast()
  const { logout } = useAuth()

  const handleError = useCallback(
    (error: ApiError | Error) => {
      if ("status" in error) {
        // C'est une ApiError
        const apiError = error as ApiError

        switch (apiError.status) {
          case 401:
            addToast({
              type: "error",
              message: "Session expirée. Veuillez vous reconnecter.",
            })
            logout()
            break
          case 403:
            addToast({
              type: "error",
              message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
            })
            break
          case 404:
            addToast({
              type: "error",
              message: "Ressource non trouvée.",
            })
            break
          case 422:
            // Erreurs de validation
            if (apiError.errors) {
              Object.entries(apiError.errors).forEach(([field, messages]) => {
                messages.forEach((message) => {
                  addToast({
                    type: "error",
                    message: `${field}: ${message}`,
                  })
                })
              })
            } else {
              addToast({
                type: "error",
                message: apiError.message,
              })
            }
            break
          case 500:
            addToast({
              type: "error",
              message: "Erreur serveur. Veuillez réessayer plus tard.",
            })
            break
          default:
            addToast({
              type: "error",
              message: apiError.message || "Une erreur est survenue",
            })
        }
      } else {
        // Erreur générique
        addToast({
          type: "error",
          message: error.message || "Une erreur inattendue est survenue",
        })
      }
    },
    [addToast, logout],
  )

  return { handleError }
}
