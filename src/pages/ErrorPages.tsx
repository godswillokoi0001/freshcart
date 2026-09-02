import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, ServerCrash, WifiOff } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Logo } from "@components/shared/Logo"

type ErrorPageProps = { code: number; title: string; message: string; icon: LucideIcon; actionLabel?: string; actionHref?: string }

function ErrorPage({ code, title, message, icon: Icon, actionLabel = "Go Home", actionHref = "/" }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <div className="max-w-md w-full text-center">
        <Logo className="mx-auto mb-8" />
        <div className="mb-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy-100 text-navy-400">
            <Icon className="h-12 w-12" />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold text-navy-900">{code}</h1>
        <h2 className="mb-4 text-xl font-semibold text-navy-700">{title}</h2>
        <p className="mb-8 text-base text-navy-500">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild><Link to={actionHref}>{actionLabel}</Link></Button>
          <Button size="lg" variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      icon={AlertCircle}
    />
  )
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      code={403}
      title="Access Denied"
      message="You don't have permission to access this page."
      icon={AlertCircle}
    />
  )
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="Server Error"
      message="Something went wrong on our end. Please try again later."
      icon={ServerCrash}
    />
  )
}

export function OfflinePage() {
  return (
    <ErrorPage
      code={0}
      title="You're Offline"
      message="No internet connection detected. Please check your connection and try again."
      icon={WifiOff}
      actionLabel="Retry"
      actionHref="#"
    />
  )
}
