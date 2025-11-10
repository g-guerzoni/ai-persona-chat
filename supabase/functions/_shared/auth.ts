import type { SupabaseClient } from "jsr:@supabase/supabase-js@2"
import { errorResponse } from "./cors.ts"

/**
 * Require authentication for an Edge Function
 * Returns the authenticated user ID or throws an error response
 */
export async function requireAuth(
  supabase: SupabaseClient
): Promise<{ userId: string } | Response> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return errorResponse("Unauthorized - please sign in", 401)
  }

  return { userId: user.id }
}

/**
 * Get optional authentication (doesn't fail if not authenticated)
 * Returns the user ID if authenticated, null otherwise
 */
export async function getOptionalAuth(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id || null
}
