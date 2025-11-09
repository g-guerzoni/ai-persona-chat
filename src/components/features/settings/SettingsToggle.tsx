"use client"

import { Button } from "@/components/ui/button"

export interface SettingsToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export function SettingsToggle({ isOpen, onToggle }: SettingsToggleProps) {
  return (
    <Button variant="outline" size="sm" onClick={onToggle} className="w-full">
      {isOpen ? "Close" : "Open"} Settings
    </Button>
  )
}
