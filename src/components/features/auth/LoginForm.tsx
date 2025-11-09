"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormError } from "@/types/auth"

export function LoginForm() {
  const { signIn, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<FormError | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      setError({ message: "Please fill in all fields" })
      setIsLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError({ field: "email", message: "Please enter a valid email address" })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError({ message: error.message || "Failed to sign in" })
      } else {
        // Success - AuthContext will handle redirect
        router.push("/")
        router.refresh()
      }
    } catch (_err) {
      setError({ message: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Login form">
      {error && (
        <div
          className="bg-destructive/10 text-destructive border-destructive rounded-md border p-3 text-sm"
          role="alert"
          aria-live="assertive"
          id="login-error"
        >
          {error.message}
        </div>
      )}

      <fieldset disabled={isLoading || authLoading} className="flex flex-col gap-4">
        <legend className="sr-only">Login credentials</legend>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || authLoading}
            required
            aria-invalid={error?.field === "email" ? "true" : "false"}
            aria-describedby={error?.field === "email" ? "login-error" : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || authLoading}
            required
            aria-invalid={error?.field === "password" ? "true" : "false"}
            aria-describedby={error?.field === "password" ? "login-error" : undefined}
          />
        </div>

        <Button type="submit" disabled={isLoading || authLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </fieldset>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
