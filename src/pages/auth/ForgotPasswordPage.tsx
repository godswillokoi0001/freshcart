import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle2, RotateCw } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { useToast } from "@context/ToastContext"
import { useAuth } from "@context/AuthContext"
import { Logo } from "@components/shared/Logo"
import { authApi, setToken } from "@services/api"
import { cn } from "@lib/utils"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [step, setStep] = React.useState<"EMAIL" | "CODE_AND_NEW_PASSWORD">("EMAIL")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setErrors({ email: "Email is required" })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrors({ email: "Enter a valid email address" })
      return
    }

    setLoading(true)
    setErrors({})
    try {
      const res = await authApi.sendResetCode(cleanEmail)
      success("Code Dispatched!", res.message || `A 6-digit code has been sent to ${cleanEmail}`)
      setStep("CODE_AND_NEW_PASSWORD")
      setCountdown(60)
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code. Please try again."
      toastError("Error", msg)
      setErrors({ email: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    try {
      const res = await authApi.sendResetCode(email.trim())
      success("New Code Sent!", res.message || "A new 6-digit code has been sent to your email.")
      setCountdown(60)
    } catch (err: any) {
      toastError("Resend Failed", err.message || "Failed to resend code.")
    } finally {
      setResending(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    const cleanCode = code.trim().replace(/\s+/g, "")
    if (!cleanCode) errs.code = "Verification code is required"
    else if (cleanCode.length !== 6) errs.code = "Code must be 6 digits"

    if (!newPassword) errs.newPassword = "New password is required"
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters"

    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match"

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const res = await authApi.resetPasswordWithCode({
        email: email.trim(),
        code: cleanCode,
        newPassword,
      })

      if (res.token) {
        setToken(res.token)
      }

      success("Password Reset Successful", "Your password has been updated. You are now logged in!")
      navigate("/account", { replace: true })
    } catch (err: any) {
      const msg = err.message || "Failed to reset password. Please verify the code and try again."
      toastError("Reset Failed", msg)
      setErrors({ form: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fc-chalk py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <Link to="/sign-in" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-fc-smoke hover:text-fc-earth transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold font-display italic text-fc-earth">
            {step === "EMAIL" ? "Forgot your password?" : "Enter verification code"}
          </h1>
          <p className="mt-2 text-sm text-fc-smoke max-w-sm mx-auto">
            {step === "EMAIL"
              ? "Enter your account email and we'll send you an instant 6-digit security code."
              : `Enter the 6-digit code sent to ${email} and choose your new password.`}
          </p>
        </div>

        {errors.form && (
          <div className="mb-4 p-3.5 bg-danger-50 border border-danger-200 text-danger-700 text-sm">
            {errors.form}
          </div>
        )}

        {step === "EMAIL" && (
          <form onSubmit={handleSendCode} className="space-y-4 border border-fc-cream-200 bg-white p-6 sm:p-8 shadow-sm" noValidate>
            <div>
              <Label htmlFor="email" className="text-fc-earth font-semibold">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })) }}
                  placeholder="you@example.com"
                  className={cn("pl-9 border-fc-cream-200 focus:border-fc-leaf", errors.email && "border-danger-500")}
                  autoComplete="email"
                  disabled={loading}
                  style={{ borderRadius: 0 }}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs font-medium text-danger-600">{errors.email}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-fc-market hover:bg-fc-market-600 text-white font-bold h-11"
              disabled={loading}
              style={{ borderRadius: 0 }}
            >
              {loading ? "Dispatching code…" : "Send 6-Digit Code"}
            </Button>
          </form>
        )}

        {step === "CODE_AND_NEW_PASSWORD" && (
          <form onSubmit={handleResetPassword} className="space-y-4 border border-fc-cream-200 bg-white p-6 sm:p-8 shadow-sm" noValidate>
            <div className="flex items-center justify-between pb-2 border-b border-fc-cream-200">
              <span className="text-xs text-fc-smoke truncate max-w-[240px]">Sending to <strong>{email}</strong></span>
              <button
                type="button"
                onClick={() => { setStep("EMAIL"); setErrors({}); setCode("") }}
                className="text-xs text-fc-market hover:underline font-semibold"
              >
                Change email
              </button>
            </div>

            <div>
              <Label htmlFor="code" className="text-fc-earth font-semibold">6-Digit Verification Code</Label>
              <div className="relative mt-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "")
                    setCode(clean)
                    setErrors((p) => ({ ...p, code: "" }))
                  }}
                  placeholder="123456"
                  className={cn("pl-9 font-mono tracking-widest text-lg font-bold text-center border-fc-cream-200 focus:border-fc-leaf", errors.code && "border-danger-500")}
                  disabled={loading}
                  style={{ borderRadius: 0 }}
                />
              </div>
              {errors.code && <p className="mt-1 text-xs font-medium text-danger-600">{errors.code}</p>}
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-fc-earth font-semibold">New Password</Label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })) }}
                  placeholder="At least 8 characters"
                  className={cn("pl-9 pr-10 border-fc-cream-200 focus:border-fc-leaf", errors.newPassword && "border-danger-500")}
                  disabled={loading}
                  style={{ borderRadius: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fc-smoke hover:text-fc-earth"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-xs font-medium text-danger-600">{errors.newPassword}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-fc-earth font-semibold">Confirm New Password</Label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })) }}
                  placeholder="Repeat your new password"
                  className={cn("pl-9 border-fc-cream-200 focus:border-fc-leaf", errors.confirmPassword && "border-danger-500")}
                  disabled={loading}
                  style={{ borderRadius: 0 }}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs font-medium text-danger-600">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-fc-market hover:bg-fc-market-600 text-white font-bold h-11"
              disabled={loading}
              style={{ borderRadius: 0 }}
            >
              {loading ? "Updating password…" : "Reset Password & Sign In"}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || resending}
                className="text-xs text-fc-smoke hover:text-fc-earth font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCw className={cn("h-3.5 w-3.5", resending && "animate-spin")} />
                {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
