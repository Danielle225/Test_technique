"use client"

import { useToast } from "@/contexts/ToastContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800"
      case "error":
        return "border-red-200 bg-red-50 text-red-800"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      default:
        return "border-blue-200 bg-blue-50 text-blue-800"
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          className={cn(
            "flex items-center justify-between animate-in slide-in-from-right-full",
            getToastStyles(toast.type),
          )}
        >
          <div className="flex items-center gap-2">
            {getToastIcon(toast.type)}
            <AlertDescription>{toast.message}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeToast(toast.id)}
            className="h-auto p-1 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
