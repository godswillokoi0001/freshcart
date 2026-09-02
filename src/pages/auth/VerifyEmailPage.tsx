import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Mail, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@components/ui/Button"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { Logo } from "@components/shared/Logo"

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [, setParams] = useSearchParams()
  const { signIn } = useAuth()
  const { success, error } = useToast()
  const token = new URLSearchParams(window.location.search).get("token")
  const [verified, setVerified] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
        <div className="w-full max-w-md rounded-lg border border-navy-200 bg-white p-6 text-center shadow-sm">
          <Logo className="mx-auto" />
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Invalid Verification Link</h1>
          <p className="mt-2 text-sm text-navy-500">This email verification link is missing or invalid.</p>
          <Button className="mt-6 w-full" asChild><Link to="/sign-in">Sign In</Link></Button>
        </div>
      </div>
    )
  }

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    await new Promise((r) => setTimeout(r, 800))
    setVerified(true)
    setLoading(false)
    success("Email verified!", "Your account is now active.")
    setTimeout(() => navigate("/sign-in"), 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-navy-900">
            {verified ? "Email Verified!" : "Verify Your Email"}
          </h1>
          <p className="mt-2 text-sm text-navy-500">
            {verified
              ? "Your email has been verified. Redirecting to sign in…"
              : "Enter the 6-digit code sent to your email, or click the verification link."}
          </p>
        </div>

        {!verified ? (
          <div className="space-y-4 rounded-lg border border-navy-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm text-navy-500">
              <span>Verification token</span>
              <code className="font-mono text-navy-700 bg-navy-100 px-2 py-0.5 rounded">{token.slice(0, 8)}…</code>
            </div>

            <div className="flex items-center gap-3 text-sm text-navy-500">
              <Clock className="h-4 w-4" />
              <span>This link expires in 24 hours.</span>
            </div>

            <Button className="w-full" size="lg" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying…" : "Verify Email"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-navy-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-navy-400">Or enter code manually</span></div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  className="h-12 w-12 text-center text-2xl font-bold rounded-lg border border-navy-200 focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
              ))}
            </div>

            <p className="text-center text-sm text-navy-500">
              Didn't receive the code? <Button variant="ghost" size="sm" className="p-0" onClick={() => error("Resend not implemented", "This is a demo")}>Resend</Button>
            </p>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-fresh-600 bg-fresh-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fresh-100 text-fresh-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-navy-900">Email Verified!</h2>
            <p className="mt-2 text-sm text-navy-600">Welcome to FreshCart. Redirecting…</p>
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-fresh-100">
              <div className="h-full bg-fresh-600 animate-[progress_1.5s_ease-out_forwards]" style={{ width: "100%" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
