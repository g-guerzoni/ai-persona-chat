import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/features/auth/LoginForm"

export default function LoginPage() {
  return (
    <main id="main-content">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p id="login-description" className="text-muted-foreground mt-1 text-sm">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
      </Card>
    </main>
  )
}
