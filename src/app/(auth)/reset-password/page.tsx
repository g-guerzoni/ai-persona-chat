"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormError } from "@/types/auth"

export default function ResetPasswordPage() {
  const { updatePassword, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<FormError | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Basic validation
    if (!password || !confirmPassword) {
      setError({ message: "Please fill in all fields" })
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
      const { error } = await updatePassword(password)

      if (error) {
        setError({ message: error.message || "Failed to update password" })
      } else {
        // Success - redirect to home
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
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Set new password</h2>
        <p className="text-muted-foreground mt-1 text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive border-destructive rounded-md border p-3 text-sm">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || authLoading}
            required
          />
          <p className="text-muted-foreground text-xs">Must be at least 8 characters</p>
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
          />
        </div>

        <Button type="submit" disabled={isLoading || authLoading} className="w-full">
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Card>
  )
}
