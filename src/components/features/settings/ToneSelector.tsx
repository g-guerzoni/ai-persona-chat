"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface ToneSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function ToneSelector({ value, onValueChange }: ToneSelectorProps) {
  return (
    <fieldset className="flex w-full flex-col gap-2">
      <legend className="text-primary text-lg font-medium">Tone</legend>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="grid w-full grid-cols-2 gap-2"
        aria-label="Select conversation tone"
      >
        <ToggleGroupItem
          value="friendly"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Friendly tone"
        >
          Friendly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="professional"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Professional tone"
        >
          Professional
        </ToggleGroupItem>
      </ToggleGroup>
    </fieldset>
  )
}
