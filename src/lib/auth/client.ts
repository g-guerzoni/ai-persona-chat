import { createClient } from "@/lib/supabase/client"

/**
 * Sign in with email and password
 * Use this in client components
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

/**
 * Sign up with email and password
 * Use this in client components
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
}

/**
 * Sign out the current user
 * Use this in client components
 */
export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

/**
 * Send password reset email
 * Use this in client components
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient()
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

/**
 * Update user password
 * Use this in client components (after password reset)
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  return await supabase.auth.updateUser({
    password: newPassword,
  })
}

/**
 * Get current session client-side
 * Use this in client components
 */
export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user client-side
 * Use this in client components
 */
export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
