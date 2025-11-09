import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Settings, Plus, Info } from "lucide-react"

export interface ChatHeaderProps {
  name: string
  role: string
  caseId?: string
  subject?: string
  notes?: string
  onSettingsToggle?: () => void
  onNewConversation?: () => void
  showSettingsToggle?: boolean
}

export function ChatHeader({
  name,
  role,
  caseId,
  subject,
  notes,
  onSettingsToggle,
  onNewConversation,
  showSettingsToggle = true,
}: ChatHeaderProps) {
  return (
    <header className="border-border flex items-center gap-3 border-b p-4">
      <div
        className="bg-muted flex h-12 w-12 items-center justify-center rounded-full"
        role="img"
        aria-label={`${name} avatar`}
      >
        <span className="text-foreground text-lg font-semibold" aria-hidden="true">
          {name.charAt(0)}
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground font-medium">{name}</h2>
          {caseId && (
            <span className="text-muted-foreground text-xs" aria-label={`Case ID ${caseId}`}>
              #{caseId}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{role}</p>
      </div>
      <div className="flex items-center gap-2">
        {(subject || notes) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="View conversation details">
                  <Info className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <div className="flex flex-col gap-2">
                  {subject && (
                    <div>
                      <p className="font-semibold">Subject:</p>
                      <p className="text-sm">{subject}</p>
                    </div>
                  )}
                  {notes && (
                    <div>
                      <p className="font-semibold">Notes:</p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button variant="accent" size="sm" onClick={onNewConversation} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Conversation
        </Button>
        {showSettingsToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsToggle}
            aria-label="Toggle settings panel"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </header>
  )
}
