"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormError } from "@/types/auth"

export function SignupForm() {
  const { signUp, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<FormError | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
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

    // Password validation
    if (password.length < 8) {
      setError({ field: "password", message: "Password must be at least 8 characters" })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError({ field: "confirmPassword", message: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, {
        name,
      })

      if (error) {
        setError({ message: error.message || "Failed to sign up" })
      } else {
        setSuccess(true)
        // Don't redirect - show success message about checking email
      }
    } catch (_err) {
      setError({ message: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center" role="status" aria-live="polite">
        <div className="bg-primary/10 text-primary border-primary rounded-md border p-4">
          <h3 className="mb-2 font-semibold">Check your email!</h3>
          <p className="text-sm">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please check your inbox
            and click the link to verify your account.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} variant="outline">
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Sign up form">
      {error && (
        <div
          className="bg-destructive/10 text-destructive border-destructive rounded-md border p-3 text-sm"
          role="alert"
          aria-live="assertive"
          id="signup-error"
        >
          {error.message}
        </div>
      )}

      <fieldset disabled={isLoading || authLoading} className="flex flex-col gap-4">
        <legend className="sr-only">Sign up information</legend>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || authLoading}
            required
            aria-invalid={error?.field === "name" ? "true" : "false"}
            aria-describedby={error?.field === "name" ? "signup-error" : undefined}
          />
        </div>

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
            aria-describedby={error?.field === "email" ? "signup-error" : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || authLoading}
            required
            aria-invalid={error?.field === "password" ? "true" : "false"}
            aria-describedby={
              error?.field === "password"
                ? "signup-error password-requirements"
                : "password-requirements"
            }
          />
          <p id="password-requirements" className="text-muted-foreground text-xs">
            Must be at least 8 characters
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading || authLoading}
            required
            aria-invalid={error?.field === "confirmPassword" ? "true" : "false"}
            aria-describedby={error?.field === "confirmPassword" ? "signup-error" : undefined}
          />
        </div>

        <Button type="submit" disabled={isLoading || authLoading} className="w-full">
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </fieldset>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
