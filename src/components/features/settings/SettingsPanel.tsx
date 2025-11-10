"use client"

import { ToneSelector } from "./ToneSelector"
import { TraitSelector } from "./TraitSelector"
import type { ScenarioMetadata } from "@/types/conversation"
import type { ConversationSettings } from "@/hooks/useConversation"

export interface SettingsPanelProps {
  metadata: ScenarioMetadata | null
  settings: ConversationSettings
  onSettingsChange: (settings: Partial<ConversationSettings>) => void
}

export function SettingsPanel({ metadata, settings, onSettingsChange }: SettingsPanelProps) {
  if (!metadata) {
    return (
      <aside className="flex h-full items-center justify-center p-6" aria-label="Persona settings">
        <p className="text-muted-foreground" role="status">
          Loading scenario...
        </p>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col gap-6 p-6" aria-label="Persona settings">
      <h2 className="text-lg font-semibold">Persona Settings</h2>

      {settings.isLocked && (
        <div
          className="bg-muted text-muted-foreground rounded-md p-3 text-sm"
          role="status"
          aria-live="polite"
        >
          Settings locked during conversation
        </div>
      )}

      <ToneSelector
        value={settings.tone}
        onValueChange={(tone) => onSettingsChange({ tone: tone as "friendly" | "professional" })}
        disabled={settings.isLocked}
      />

      <TraitSelector
        label="Primary Trait"
        traitName={metadata.primaryTrait}
        value={settings.primaryLevel}
        onValueChange={(primaryLevel) => onSettingsChange({ primaryLevel })}
        disabled={settings.isLocked}
      />

      <TraitSelector
        label="Secondary Trait"
        traitName={metadata.secondaryTrait}
        value={settings.secondaryLevel}
        onValueChange={(secondaryLevel) => onSettingsChange({ secondaryLevel })}
        disabled={settings.isLocked}
      />
    </aside>
  )
}
