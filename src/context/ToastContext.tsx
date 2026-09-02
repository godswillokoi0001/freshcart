import * as React from "react"
import type { ToastProps } from "@components/ui/Toast"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@components/ui/Toast"

type ToastItem = {
  id: string
  title: string
  description?: string
  variant?: ToastProps["variant"]
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setItems((prev) => [...prev, { ...t, id }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  const success = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "success" }),
    [toast]
  )
  const error = React.useCallback(
    (title: string, description?: string) => toast({ title, description, variant: "destructive" }),
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <ToastProvider swipeDirection="right">
        {items.map((t) => (
          <Toast key={t.id} variant={t.variant}>
            <div className="grid gap-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within AppToastProvider")
  return ctx
}
