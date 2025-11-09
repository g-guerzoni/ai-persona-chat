import { Card } from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email to receive a reset link
        </p>
      </div>
      <ResetPasswordForm />
    </Card>
  )
}
