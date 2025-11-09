import { Card } from "@/components/ui/card"
import { SignupForm } from "@/components/features/auth/SignupForm"

export default function SignupPage() {
  return (
    <main id="main-content">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p id="signup-description" className="text-muted-foreground mt-1 text-sm">
            Start training your conversation skills today
          </p>
        </div>
        <SignupForm />
      </Card>
    </main>
  )
}
