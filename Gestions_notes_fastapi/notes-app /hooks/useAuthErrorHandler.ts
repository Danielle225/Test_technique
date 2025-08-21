"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"

export function useAuthErrorHandler() {
  const router = useRouter()
  const { logout } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // 🔧 Ne gérer QUE les erreurs d'authentification
        if (response.status === 401) {
          console.log("🔒 Session expirée - Déconnexion automatique")
          
          addToast({
            type: "avertissement",
            message: "Votre session a expiré. Vous allez être redirigé vers la page de connexion.",
          })
          
          await logout()
          
          setTimeout(() => {
            router.push("/login")
          }, 1500)
        }
        
        // 🔧 403 - Accès refusé
        if (response.status === 403) {
          addToast({
            type: "erreur",
            message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
          })
        }
        
        return response
      } catch (error) {
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [router, logout, addToast])
}