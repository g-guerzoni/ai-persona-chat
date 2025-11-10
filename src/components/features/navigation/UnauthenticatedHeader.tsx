import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { Github } from "lucide-react"
import Link from "next/link"

export function UnauthenticatedHeader() {
  return (
    <header className="border-border bg-card w-full border-b" role="banner">
      <div className="flex h-[72px] items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xl font-semibold">{siteConfig.name}</span>
        </div>

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
