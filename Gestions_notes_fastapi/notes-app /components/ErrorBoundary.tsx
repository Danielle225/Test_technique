"use client"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups ! Une erreur est survenue</h1>
            <p className="text-gray-600 mb-6">
              {typeof this.state.error?.message === 'string' 
                ? this.state.error.message 
                : "Une erreur inattendue s'est produite."}
            </p>
            <Button onClick={() => window.location.reload()} className="mr-2">
              Recharger la page
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Réessayer
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
