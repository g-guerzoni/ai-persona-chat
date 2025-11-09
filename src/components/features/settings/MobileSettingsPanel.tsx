"use client"

import { SettingsPanel } from "./SettingsPanel"
import type { ScenarioMetadata } from "@/types/conversation"
import type { ConversationSettings } from "@/hooks/useConversation"

export interface MobileSettingsPanelProps {
  isOpen: boolean
  metadata: ScenarioMetadata | null
  settings: ConversationSettings
  onSettingsChange: (settings: Partial<ConversationSettings>) => void
}

export function MobileSettingsPanel({
  isOpen,
  metadata,
  settings,
  onSettingsChange,
}: MobileSettingsPanelProps) {
  return (
    <div
      className={`border-border overflow-hidden border-b transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className={`h-full overflow-y-auto ${isOpen ? "opacity-100" : "opacity-0"}`}>
        <SettingsPanel
          metadata={metadata}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </div>
    </div>
  )
}
