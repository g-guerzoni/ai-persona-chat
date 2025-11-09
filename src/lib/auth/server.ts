import { createClient } from "@/lib/supabase/server"
import type { User } from "@/types/auth"

/**
 * Get the current authenticated user from server-side
 * Use this in Server Components, Server Actions, and API Routes
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current session from server-side
 * Use this in Server Components, Server Actions, and API Routes
 */
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated server-side
 * Returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}

/**
 * Require authentication - throws if not authenticated
 * Use this to protect server actions and API routes
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    throw new Error("Unauthorized - authentication required")
  }
  return user
}
