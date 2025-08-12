"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "../types"
import { AuthService } from "../services/auth.service"
import { AuthStorage } from "../lib/auth-storage"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      // Vérifier si on a des données stockées
      const storedToken = AuthStorage.getToken()
      const storedUser = AuthStorage.getUser()
      
      if (storedToken && storedUser) {
        console.log("✅ Données d'authentification trouvées:", { token: storedToken.substring(0, 20) + '...', user: storedUser })
        setToken(storedToken)
        setUser(storedUser)
      } else {
        console.log("ℹ️ Aucune données d'authentification trouvées")
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error)
      // En cas d'erreur, nettoyer les données corrompues
      AuthStorage.clearAll()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password)
      
      // Validation stricte de la structure utilisateur
      const safeUser: User = {
        id: String(response.user?.id || Date.now()),
        email: String(response.user?.email || email),
      }
      
      console.log("✅ Utilisateur sécurisé créé:", safeUser)
      console.log("✅ Token reçu:", response.token.substring(0, 20) + '...')
      
      // Sauvegarder dans le localStorage
      AuthStorage.setToken(response.token)
      AuthStorage.setUser(safeUser)
      
      // Mettre à jour l'état local
      setUser(safeUser)
      setToken(response.token)
      
      console.log("✅ Login réussi et données sauvegardées")
    } catch (error) {
      console.error("❌ Erreur lors du login:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      // Nettoyer le localStorage et l'état
      AuthStorage.clearAll()
      setUser(null)
      setToken(null)
      console.log("✅ Déconnexion réussie et données nettoyées")
    }
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider")
  }
  return context
}
