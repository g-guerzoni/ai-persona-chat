"use client"

import { SettingsPanel } from "./SettingsPanel"

export interface MobileSettingsPanelProps {
  isOpen: boolean
}

export function MobileSettingsPanel({ isOpen }: MobileSettingsPanelProps) {
  return (
    <div
      className={`border-border overflow-hidden border-b transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className={`h-full overflow-y-auto ${isOpen ? "opacity-100" : "opacity-0"}`}>
        <SettingsPanel />
      </div>
    </div>
  )
}
