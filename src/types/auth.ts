import type { User as SupabaseUser, Session } from "@supabase/supabase-js"

export type { Session } from "@supabase/supabase-js"

// Extended user type with custom metadata
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface User extends SupabaseUser {
  // Add any custom user metadata fields here if needed
}

// Auth state interface
export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

// Auth context value interface
export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

// Form error interface
export interface FormError {
  field?: string
  message: string
}
