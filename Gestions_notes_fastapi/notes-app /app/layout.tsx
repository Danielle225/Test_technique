import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ToastProvider } from "@/contexts/ToastContext"
import { ToastContainer } from "@/components/ToastContainer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { DebugComponent } from "@/components/DebugComponent"
import { ReactDebugger } from "@/components/ReactDebugger"
import {IsAuthenticated} from "@/lib/auth_check"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Notes App - Gestionnaire de Notes",
  description: "Application de gestion de notes avec éditeur Markdown",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        
        <ErrorBoundary>
          <ReactDebugger />
          <DebugComponent />
          <AuthProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
        
      </body>
    </html>
  )
}
