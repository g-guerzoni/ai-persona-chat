import { useAuthContext } from "@/contexts/AuthContext"

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

export function useAuth() {
  const { user, session, isLoading, signIn, signOut } = useAuthContext()

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
    signup: async () => {
      throw new Error("Signup via useAuth hook is deprecated. Use AuthContext directly.")
    },
  }
}
