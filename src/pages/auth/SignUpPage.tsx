import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"
import { cn } from "@lib/utils"

export function SignUpPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { success } = useToast()
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "", confirm: "" })
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Full name is required"
    if (!form.email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format"
    if (!form.phone.trim()) errs.phone = "Phone number is required"
    else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) errs.phone = "Enter a valid Nigerian phone number"
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
    signIn("customer", form.name)
    setLoading(false)
    success("Account created!", "Welcome to FreshCart")
    navigate("/account")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Create your account</h1>
          <p className="mt-2 text-sm text-navy-500">Join FreshCart and start shopping fresh</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-navy-200 bg-white p-6 shadow-sm" noValidate>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((p) => ({ ...p, name: "" })) }}
                placeholder="Amaka Obi"
                className={cn("pl-9", errors.name && "border-danger-500 focus:border-danger-500")}
                autoComplete="name"
                disabled={loading}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: "" })) }}
                placeholder="you@example.com"
                className={cn("pl-9", errors.email && "border-danger-500 focus:border-danger-500")}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1">
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors((p) => ({ ...p, phone: "" })) }}
                placeholder="+234 803 555 1234"
                className={cn("pl-9", errors.phone && "border-danger-500 focus:border-danger-500")}
                autoComplete="tel"
                disabled={loading}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-danger-600">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirm">Confirm Password</Label>
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
            {loading ? "Creating account…" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-navy-500">
            Already have an account? <Link to="/sign-in" className="font-medium text-fresh-700 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
