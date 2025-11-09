import { Card } from "@/components/ui/card"
import { SignupForm } from "@/components/features/auth/SignupForm"

export default function SignupPage() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Start training your conversation skills today
        </p>
      </div>
      <SignupForm />
    </Card>
  )
}
