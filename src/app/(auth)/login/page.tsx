import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/features/auth/LoginForm"

export default function LoginPage() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
      </div>
      <LoginForm />
    </Card>
  )
}
