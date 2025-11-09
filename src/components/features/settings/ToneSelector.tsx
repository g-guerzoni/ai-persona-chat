"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface ToneSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToneSelector({ value, onValueChange }: ToneSelectorProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-primary text-lg font-medium">Tone</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="grid w-full grid-cols-2 gap-2"
      >
        <ToggleGroupItem
          value="friendly"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Friendly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="professional"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Professional
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
