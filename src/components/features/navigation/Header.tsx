import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { siteConfig } from "@/config/site"
import { Github, Square, Diamond, Circle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export interface HeaderProps {
  isAuthenticated?: boolean
  userName?: string
  userAvatar?: string
  gamificationScores?: {
    square: number
    diamond: number
    circle: number
  }
  onLogout?: () => void
}

export function Header({
  isAuthenticated = false,
  userName = "User Name",
  userAvatar,
  gamificationScores = {
    square: 1,
    diamond: 1,
    circle: 1,
  },
  onLogout,
}: HeaderProps) {
  if (isAuthenticated) {
    return (
      <header className="border-border bg-card relative w-full border-b" role="banner">
        <div className="relative flex h-[72px] items-center justify-between px-6">
          {/* User Profile */}
          <div className="flex items-center gap-4" aria-label="User profile">
            {/* Avatar */}
            <div
              className="border-foreground bg-background relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2"
              role="img"
              aria-label={`${userName} avatar`}
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={`${userName} profile picture`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="text-foreground text-lg font-semibold" aria-hidden="true">
                  {userName.charAt(0)}
                </span>
              )}
            </div>

            {/* User Info with Gamification */}
            <div className="flex flex-col gap-1">
              <span className="text-foreground text-sm font-medium">{userName}</span>
              <TooltipProvider>
                <div
                  className="text-muted-foreground flex items-center gap-3"
                  aria-label="Gamification scores"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-1">
                        <Square
                          className="h-3 w-3"
                          style={{ color: "oklch(0.65 0.22 60)" }}
                          aria-hidden="true"
                        />
                        <span
                          className="text-xs"
                          aria-label={`Clarity score: ${gamificationScores.square}`}
                        >
                          {gamificationScores.square}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clarity</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-1">
                        <Diamond
                          className="h-3 w-3"
                          style={{ color: "oklch(0.7 0.2 140)" }}
                          aria-hidden="true"
                        />
                        <span
                          className="text-xs"
                          aria-label={`Friendly score: ${gamificationScores.diamond}`}
                        >
                          {gamificationScores.diamond}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Friendly</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-1">
                        <Circle
                          className="h-3 w-3"
                          style={{ color: "oklch(0.65 0.22 180)" }}
                          aria-hidden="true"
                        />
                        <span
                          className="text-xs"
                          aria-label={`Empathy score: ${gamificationScores.circle}`}
                        >
                          {gamificationScores.circle}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Empathy</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>

          {/* Action Buttons */}
          <nav className="flex items-center gap-3" aria-label="Main navigation">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View GitHub repository"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="destructive" onClick={onLogout} className="min-w-[100px]">
              Logout
            </Button>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="border-border bg-card w-full border-b" role="banner">
      <div className="flex h-[72px] items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xl font-semibold">{siteConfig.name}</span>
        </div>

        {/* Auth Buttons */}
        <nav className="flex items-center gap-3" aria-label="Authentication navigation">
          <Button variant="outline" asChild className="min-w-[100px]">
            <Link href="/signup">Signup</Link>
          </Button>
          <Button variant="outline" asChild className="min-w-[100px]">
            <Link href="/login">Signin</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View GitHub repository"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
