import * as React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, ShieldCheck, KeyRound } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"
import { cn } from "@lib/utils"

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { error: toastError, success: toastSuccess } = useToast()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format"
    if (!password) errs.password = "Password is required"
    else if (password.length < 6) errs.password = "Password must be at least 6 characters"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(email, password)
      toastSuccess("Welcome back!", `Signed in as ${user.name}`)

      // Redirect based on authorized role or return path
      const fromPath = (location.state as any)?.from?.pathname
      if (fromPath && fromPath !== "/sign-in" && fromPath !== "/sign-up") {
        navigate(fromPath, { replace: true })
        return
      }

      switch (user.role) {
        case "super-admin":
          navigate("/super-admin", { replace: true })
          break
        case "admin":
          navigate("/admin", { replace: true })
          break
        case "staff":
          navigate("/staff", { replace: true })
          break
        case "rider":
          navigate("/rider", { replace: true })
          break
        default:
          navigate("/account", { replace: true })
          break
      }
    } catch (err: any) {
      const msg = err.message || "Invalid email or password"
      setErrors({ form: msg })
      toastError("Authentication failed", msg)
    } finally {
      setLoading(false)
    }
  }

  const quickFillCredentials = (emailVal: string) => {
    setEmail(emailVal)
    setPassword("FreshCart2026!")
    setErrors({})
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Welcome back</h1>
          <p className="mt-2 text-sm text-navy-500">Sign in with your verified FreshCart credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-navy-200 bg-white p-6 sm:p-8 shadow-sm" noValidate>
          {errors.form && (
            <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "", form: "" })) }}
                placeholder="you@example.com"
                className={cn("pl-9", errors.email && "border-danger-500 focus:border-danger-500")}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm font-medium text-fresh-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "", form: "" })) }}
                placeholder="••••••••"
                className={cn("pl-9 pr-10", errors.password && "border-danger-500 focus:border-danger-500")}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger-600">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Authenticating…" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-navy-500">
            Don't have an account? <Link to="/sign-up" className="font-medium text-fresh-700 hover:underline">Create one</Link>
          </p>

          <div className="pt-4 border-t border-navy-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Quick Fill Account Credentials
              </span>
              <span className="text-[11px] text-navy-400">Password: FreshCart2026!</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => quickFillCredentials("customer@freshcart.ng")}
                className="p-1.5 text-left rounded bg-navy-50 hover:bg-navy-100 text-navy-700 font-medium transition-colors border border-navy-200/60"
              >
                🛒 Customer
              </button>
              <button
                type="button"
                onClick={() => quickFillCredentials("staff@freshcart.ng")}
                className="p-1.5 text-left rounded bg-navy-50 hover:bg-navy-100 text-navy-700 font-medium transition-colors border border-navy-200/60"
              >
                📋 Staff
              </button>
              <button
                type="button"
                onClick={() => quickFillCredentials("rider@freshcart.ng")}
                className="p-1.5 text-left rounded bg-navy-50 hover:bg-navy-100 text-navy-700 font-medium transition-colors border border-navy-200/60"
              >
                🛵 Rider
              </button>
              <button
                type="button"
                onClick={() => quickFillCredentials("admin@freshcart.ng")}
                className="p-1.5 text-left rounded bg-navy-50 hover:bg-navy-100 text-navy-700 font-medium transition-colors border border-navy-200/60"
              >
                📊 Admin
              </button>
              <button
                type="button"
                onClick={() => quickFillCredentials("superadmin@freshcart.ng")}
                className="p-1.5 text-left rounded bg-navy-50 hover:bg-navy-100 text-navy-700 font-medium transition-colors border border-navy-200/60 col-span-2"
              >
                🔐 Super Admin (superadmin@freshcart.ng)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
