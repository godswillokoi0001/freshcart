import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"
import { cn } from "@lib/utils"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [, setParams] = useSearchParams()
  const { signIn } = useAuth()
  const { success, error } = useToast()
  const token = new URLSearchParams(window.location.search).get("token")
  const [form, setForm] = React.useState({ password: "", confirm: "" })
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
        <div className="w-full max-w-md rounded-lg border border-navy-200 bg-white p-6 text-center shadow-sm">
          <Logo className="mx-auto" />
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-navy-500">This password reset link is missing or invalid.</p>
          <Button className="mt-6 w-full" asChild><Link to="/forgot-password">Request New Link</Link></Button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.password) errs.password = "Password is required"
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters"
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match"
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
    success("Password reset!", "You can now sign in with your new password.")
    navigate("/sign-in")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Set New Password</h1>
          <p className="mt-2 text-sm text-navy-500">Your new password must be different from previous ones.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-navy-200 bg-white p-6 shadow-sm" noValidate>
          <div>
            <Label htmlFor="password">New Password</Label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors((p) => ({ ...p, password: "" })) }}
                placeholder="••••••••"
                className={cn("pl-9 pr-10", errors.password && "border-danger-500 focus:border-danger-500")}
                autoComplete="new-password"
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

          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setErrors((p) => ({ ...p, confirm: "" })) }}
                placeholder="••••••••"
                className={cn("pl-9", errors.confirm && "border-danger-500 focus:border-danger-500")}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {errors.confirm && <p className="mt-1 text-sm text-danger-600">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </Button>

          <p className="text-center text-sm text-navy-500">
            Remember your password? <Link to="/sign-in" className="font-medium text-fresh-700 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
