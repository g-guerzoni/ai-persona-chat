"use client"

import { ChatHeader } from "./ChatHeader"
import { ChatMessageList } from "./ChatMessageList"
import { MobileSettingsPanel } from "../settings/MobileSettingsPanel"
import type { ChatMessageProps } from "./ChatMessage"

export interface ChatContainerProps {
  personaName: string
  personaRole: string
  onSettingsToggle?: () => void
  messages: ChatMessageProps[]
  isProcessing?: boolean
  showMobileSettings?: boolean
  isMobile?: boolean
}

export function ChatContainer({
  personaName,
  personaRole,
  onSettingsToggle,
  messages,
  isProcessing = false,
  showMobileSettings = false,
  isMobile = false,
}: ChatContainerProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChatHeader name={personaName} role={personaRole} onSettingsToggle={onSettingsToggle} />
      {isMobile && <MobileSettingsPanel isOpen={showMobileSettings} />}
      <ChatMessageList messages={messages} />
      {isProcessing && (
        <div className="bg-muted absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md px-4 py-2">
          <span className="text-muted-foreground text-sm">Processing...</span>
        </div>
      )}
    </div>
  )
}
