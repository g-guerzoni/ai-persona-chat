"use client"

import { ChatHeader } from "./ChatHeader"
import { ChatMessageList } from "./ChatMessageList"
import { MobileSettingsPanel } from "../settings/MobileSettingsPanel"
import type { ChatMessage, ConversationSettings } from "@/hooks/useConversationAPI"
import type { ScenarioMetadata } from "@/types/conversation"

export interface ChatContainerProps {
  personaName: string
  personaRole: string
  caseId?: string
  subject?: string
  notes?: string
  onSettingsToggle?: () => void
  onNewConversation?: () => void
  messages: ChatMessage[]
  showMobileSettings?: boolean
  isMobile?: boolean
  metadata: ScenarioMetadata | null
  settings: ConversationSettings
  onSettingsChange: (settings: Partial<ConversationSettings>) => void
}

export function ChatContainer({
  personaName,
  personaRole,
  caseId,
  subject,
  notes,
  onSettingsToggle,
  onNewConversation,
  messages,
  showMobileSettings = false,
  isMobile = false,
  metadata,
  settings,
  onSettingsChange,
}: ChatContainerProps) {
  const messageProps = messages.map((msg) => ({
    content: msg.content,
    type: msg.role,
    scores: msg.scores,
  }))

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label="Chat conversation"
    >
      <ChatHeader
        name={personaName}
        role={personaRole}
        caseId={caseId}
        subject={subject}
        notes={notes}
        onSettingsToggle={onSettingsToggle}
        onNewConversation={onNewConversation}
      />
      {isMobile && (
        <MobileSettingsPanel
          isOpen={showMobileSettings}
          metadata={metadata}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}
      <ChatMessageList messages={messageProps} />
    </section>
  )
}
