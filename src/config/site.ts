/**
 * Site-wide configuration
 * Contains metadata, navigation, and other global settings
 */

export const siteConfig = {
  name: "AI Persona Chat",
  description:
    "Production-ready Next.js application with TypeScript, Tailwind, Shadcn UI, and Supabase",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/g-guerzoni/ai-persona-chat",
    docs: "/docs",
  },
}

export type SiteConfig = typeof siteConfig
