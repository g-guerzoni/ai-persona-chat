import { useAuthContext } from "@/contexts/AuthContext"

// Re-export User type from auth types
export type { User } from "@/types/auth"

export interface AuthState {
  isAuthenticated: boolean
  user: {
    id: string
    name?: string
    email: string
    avatar?: string
  } | null
}

/**
 * Custom hook for authentication state using Supabase
 * Wraps the AuthContext for easier consumption
 */
export function useAuth() {
  const { user, session, isLoading, signIn, signOut } = useAuthContext()

  // Transform Supabase user to match expected interface
  const transformedUser = user
    ? {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      }
    : null

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  return {
    isAuthenticated: !!session && !!user,
    user: transformedUser,
    isLoading,
    logout: handleLogout,
    login: handleLogin,
    // Keep signup for compatibility, though forms use context directly
    signup: async (name: string, email: string, password: string) => {
      // This is here for compatibility but not actively used
      console.log("Signup via useAuth hook:", name, email)
    },
  }
}
