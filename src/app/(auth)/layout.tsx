export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">AI Persona Chat</h1>
          <p className="text-muted-foreground mt-2">Train your conversation skills</p>
        </div>
        {children}
      </div>
    </div>
  )
}
