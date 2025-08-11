"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "@/types"
import { AuthService } from "@/services/auth.service"
import { AuthStorage } from "@/lib/auth-storage"

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
      const storedToken = AuthStorage.getToken()
      const storedUser = AuthStorage.getUser()

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)

        // Vérifier si le token est toujours valide en appelant l'API
        try {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
          AuthStorage.setUser(currentUser)
        } catch (error) {
          console.error("Token invalide, déconnexion:", error)
          await logout()
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'authentification:", error)
      await logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password)
      setUser(response.user)
      setToken(response.token)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      setUser(null)
      setToken(null)
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
