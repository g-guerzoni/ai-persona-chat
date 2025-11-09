import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export interface ChatHeaderProps {
  name: string
  role: string
  onSettingsToggle?: () => void
  showSettingsToggle?: boolean
}

export function ChatHeader({
  name,
  role,
  onSettingsToggle,
  showSettingsToggle = true,
}: ChatHeaderProps) {
  return (
    <div className="border-border flex items-center gap-3 border-b p-4">
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <span className="text-foreground text-lg font-semibold">{name.charAt(0)}</span>
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-foreground font-medium">{name}</span>
        <span className="text-muted-foreground text-sm">{role}</span>
      </div>
      {showSettingsToggle && (
        <Button variant="ghost" size="icon" onClick={onSettingsToggle}>
          <Settings className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
