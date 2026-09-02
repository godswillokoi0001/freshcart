import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"
import { cn } from "@lib/utils"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
    success("Reset link sent", "If the email exists, you'll receive a reset link shortly.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
      <div className="w-full max-w-md">
        <Link to="/sign-in" className="mb-6 inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">
            {sent ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="mt-2 text-sm text-navy-500">
            {sent
              ? `We've sent a password reset link to ${email}. The link expires in 1 hour.`
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-navy-200 bg-white p-6 shadow-sm" noValidate>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })) }}
                  placeholder="you@example.com"
                  className={cn("pl-9", errors.email && "border-danger-500 focus:border-danger-500")}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        {sent && (
          <div className="rounded-lg border border-fresh-200 bg-fresh-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fresh-100 text-fresh-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="mt-3 font-medium text-navy-900">Check your inbox</p>
            <p className="mt-1 text-sm text-navy-500">We sent a reset link. If you don't see it, check spam.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSent(false); setEmail("") }}>Try Another Email</Button>
              <Button asChild><Link to="/sign-in">Back to Sign In</Link></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
