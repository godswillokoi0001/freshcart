import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"
import { cn } from "@lib/utils"

export function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { error } = useToast()
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
    await new Promise((r) => setTimeout(r, 800))
    signIn("customer", "Amaka Obi")
    setLoading(false)
    navigate("/account")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Welcome back</h1>
          <p className="mt-2 text-sm text-navy-500">Sign in to your FreshCart account</p>
        </div>

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
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })) }}
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
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-navy-500">
            Don't have an account? <Link to="/sign-up" className="font-medium text-fresh-700 hover:underline">Create one</Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-navy-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-navy-400">Or continue with demo access</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="outline" onClick={() => { signIn("customer", "Amaka Obi"); navigate("/account") }}>
              <span className="mr-2">🛒</span> Continue as Customer (Amaka)
            </Button>
            <Button variant="outline" onClick={() => { signIn("staff", "Bola Adeyemi"); navigate("/staff") }}>
              <span className="mr-2">📋</span> Staff Portal (Bola)
            </Button>
            <Button variant="outline" onClick={() => { signIn("rider", "Michael Eze"); navigate("/rider") }}>
              <span className="mr-2">🛵</span> Rider App (Michael)
            </Button>
            <Button variant="outline" onClick={() => { signIn("admin", "Sarah Okonkwo"); navigate("/admin") }}>
              <span className="mr-2">📊</span> Admin Dashboard (Sarah)
            </Button>
            <Button variant="outline" onClick={() => { signIn("super-admin", "Uche Nwankwo"); navigate("/super-admin") }}>
              <span className="mr-2">🔐</span> Super Admin (Uche)
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
