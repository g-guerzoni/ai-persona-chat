import { AuthenticatedHeader } from "./AuthenticatedHeader"
import { UnauthenticatedHeader } from "./UnauthenticatedHeader"

export interface HeaderProps {
  isAuthenticated?: boolean
  userName?: string
  userAvatar?: string
  gamificationScores?: {
    square: number
    diamond: number
    circle: number
  }
  isLoadingScores?: boolean
  onLogout?: () => void
}

export function Header({
  isAuthenticated = false,
  userName,
  userAvatar,
  gamificationScores,
  isLoadingScores,
  onLogout,
}: HeaderProps) {
  if (isAuthenticated) {
    return (
      <AuthenticatedHeader
        userName={userName}
        userAvatar={userAvatar}
        gamificationScores={gamificationScores}
        isLoadingScores={isLoadingScores}
        onLogout={onLogout}
      />
    )
  }

  return <UnauthenticatedHeader />
}
