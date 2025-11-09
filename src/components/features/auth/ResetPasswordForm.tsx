"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormError } from "@/types/auth"

export function ResetPasswordForm() {
  const { resetPassword, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<FormError | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    // Basic validation
    if (!email) {
      setError({ message: "Please enter your email address" })
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
      const { error } = await resetPassword(email)

      if (error) {
        setError({ message: error.message || "Failed to send reset email" })
      } else {
        setSuccess(true)
      }
    } catch (_err) {
      setError({ message: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="bg-primary/10 text-primary border-primary rounded-md border p-4">
          <h3 className="mb-2 font-semibold">Check your email!</h3>
          <p className="text-sm">
            We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your
            inbox and click the link to reset your password.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} variant="outline">
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-destructive/10 text-destructive border-destructive rounded-md border p-3 text-sm">
          {error.message}
        </div>
      )}

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
        />
        <p className="text-muted-foreground text-xs">
          We&apos;ll send you a link to reset your password
        </p>
      </div>

      <Button type="submit" disabled={isLoading || authLoading} className="w-full">
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Remember your password?{" "}
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
