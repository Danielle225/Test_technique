"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "../types"
import { AuthService } from "../services/auth.service"
import { AuthStorage } from "../lib/auth-storage"
import { useRouter } from "next/navigation"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      const storedToken = AuthStorage.getToken()
      const storedUser = AuthStorage.getUser()
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch (error) {
      AuthStorage.clearAll()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password)
      
      const safeUser: User = {
        id: String(response.user?.id || Date.now()),
        email: String(response.user?.email || email),
      }
      
      AuthStorage.setToken(response.token)
      AuthStorage.setUser(safeUser)
      
      setUser(safeUser)
      setToken(response.token)
      
      // 🔧 Redirection immédiate dans le contexte
      console.log("✅ Login terminé, redirection immédiate")
      window.location.href = '/dashboard'
      
      return safeUser

    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
    } finally {
      AuthStorage.clearAll()
      setUser(null)
      setToken(null)
      router.push('/login')
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