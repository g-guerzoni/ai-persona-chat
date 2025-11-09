"use client"

import { ToneSelector } from "./ToneSelector"
import { OceanControls } from "./OceanControls"
import { useSettings } from "@/contexts/SettingsContext"

export function SettingsPanel() {
  const { tone, oceanValues, setTone, setOceanValues } = useSettings()

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <ToneSelector value={tone} onValueChange={setTone} />
      <OceanControls values={oceanValues} onValuesChange={setOceanValues} />
    </div>
  )
}
