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
        const apiError = error as ApiError

        switch (apiError.status) {
          case 401:
            addToast({
              type: "erreur",
              message: "Session expirée. Veuillez vous reconnecter.",
            })
            logout()
            break
          case 403:
            addToast({
              type: "erreur",
              message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
            })
            break
          case 404:
            addToast({
              type: "erreur",
              message: "Ressource non trouvée.",
            })
            break
          case 422:
            if (apiError.errors) {
              Object.entries(apiError.errors).forEach(([field, messages]) => {
                messages.forEach((message) => {
                  const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
                  addToast({
                    type: "erreur",
                    message: `${field}: ${messageStr}`,
                  })
                })
              })
            } else {
              addToast({
                type: "erreur",
                message: apiError.message,
              })
            }
            break
          case 500:
            addToast({
              type: "erreur",
              message: "Erreur serveur. Veuillez réessayer plus tard.",
            })
            break
          default:
            addToast({
              type: "erreur",
              message: apiError.message || "Une erreur est survenue",
            })
        }
      } else {
        addToast({
          type: "erreur",
          message: error.message || "Une erreur inattendue est survenue",
        })
      }
    },
    [addToast, logout],
  )

  return { handleError }
}
