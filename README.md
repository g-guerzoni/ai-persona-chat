# TODO: Re-write README

# AI Persona Chat - Base Project

A production-ready Next.js starter template with TypeScript, Tailwind CSS, Shadcn UI, and Supabase integration featuring a modern dark theme inspired by Convergent AI.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality

## Features

- ✅ Modern Next.js 15 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS v4 with custom configuration
- ✅ Shadcn UI components pre-configured
- ✅ **Professional dark theme** with purple/blue accents (Convergent AI inspired)
- ✅ Supabase client/server setup with middleware
- ✅ Production-level folder structure
- ✅ ESLint + Prettier + Husky for code quality
- ✅ Pre-commit hooks for linting and type checking
- ✅ Sample page with component examples

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public route group
│   │   ├── page.tsx              # Home page
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── layout/                   # Layout components
│   └── features/                 # Feature-based components
├── lib/
│   ├── supabase/                 # Supabase setup
│   │   ├── client.ts             # Client-side instance
│   │   ├── server.ts             # Server-side instance
│   │   └── middleware.ts         # Auth refresh logic
│   └── utils.ts                  # Utility functions
├── actions/                      # Server actions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
├── config/                       # App configuration
└── middleware.ts                 # Next.js middleware
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for backend features)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

To get these values:

- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project (or create a new one)
- Go to Settings > API
- Copy the URL and anon/public key

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Code Quality

This project uses pre-commit hooks to ensure code quality:

- **Lint-staged**: Runs ESLint and Prettier on staged files
- **Type checking**: Verifies TypeScript types before commit
- **Husky**: Manages git hooks

When you commit, the hooks will automatically:

1. Lint and format your code
2. Check TypeScript types
3. Prevent commit if errors are found

## Supabase Integration

The project includes three Supabase client configurations:

### Client-Side (`src/lib/supabase/client.ts`)

Use in Client Components:

```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
```

### Server-Side (`src/lib/supabase/server.ts`)

Use in Server Components and Server Actions:

```typescript
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
```

### Middleware (`src/middleware.ts`)

Automatically refreshes auth tokens on every request.

## Adding Shadcn UI Components

To add more Shadcn UI components:

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

## Color Palette

This project features a **modern dark theme** inspired by Convergent AI's aesthetic:

- **Deep navy-purple backgrounds** for a sophisticated, professional look
- **Vibrant purple-magenta primary** accent color (`oklch(0.65 0.25 310)`)
- **Electric blue secondary** accent (`oklch(0.60 0.20 250)`)
- **High contrast** text for excellent readability
- **Custom utility classes**: gradient text, glass morphism, glow effects

### Custom Utilities

```tsx
// Gradient text effect
<h1 className="gradient-text">Beautiful Heading</h1>

// Glass morphism
<Card className="glass">Frosted glass effect</Card>

// Glow effects
<Button className="glow">Glowing button</Button>
```

For complete color documentation, see [COLOR_PALETTE.md](COLOR_PALETTE.md).

## Folder Organization Guidelines

- **`src/app/`** - Only routing and page structure
- **`src/components/ui/`** - Shadcn UI components (atomic)
- **`src/components/features/`** - Business logic components
- **`src/components/layout/`** - Layout components (Header, Footer, etc.)
- **`src/lib/`** - Utilities, helpers, configurations
- **`src/actions/`** - Server Actions (use `'use server'` directive)
- **`src/hooks/`** - Custom React hooks
- **`src/types/`** - TypeScript type definitions

## Learn More

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)

### Useful Resources

- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Server Actions in Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## Deployment

### Deploy on Vercel

The easiest way to deploy:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add your environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add these in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Next Steps

1. **Set up Supabase:**
   - Create your database schema
   - Set up authentication providers
   - Configure Row Level Security (RLS) policies

2. **Build your features:**
   - Add components to `src/components/features/`
   - Create server actions in `src/actions/`
   - Add custom hooks in `src/hooks/`

3. **Customize styling:**
   - Modify `src/app/globals.css` for global styles
   - Update `tailwind.config.ts` for theme customization
   - Add new Shadcn UI components as needed

## License

This project is licensed under a **Non-Commercial Study License**.

**You may:**

- Study and learn from the code for educational purposes
- Run the software locally for learning and experimentation

**You may NOT:**

- Use for commercial purposes or business applications
- Copy, modify, or distribute the software
- Use in production environments

See the [LICENSE](LICENSE) file for full details.
