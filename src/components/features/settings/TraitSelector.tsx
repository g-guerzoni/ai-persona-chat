"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { OceanTraitKey } from "@/types/conversation"

export interface TraitSelectorProps {
  label: string
  traitName: OceanTraitKey
  value: "low" | "high"
  onValueChange: (value: "low" | "high") => void
  disabled?: boolean
}

export function TraitSelector({
  label,
  traitName,
  value,
  onValueChange,
  disabled = false,
}: TraitSelectorProps) {
  const describedById = `trait-desc-${traitName}`

  return (
    <fieldset className="flex w-full flex-col gap-2" disabled={disabled}>
      <legend className="flex flex-col">
        <span id={describedById} className="text-muted-foreground text-xs">
          ({label})
        </span>
        <span className="text-primary text-lg font-medium capitalize">{traitName}</span>
      </legend>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onValueChange(val as "low" | "high")}
        className="grid w-full grid-cols-2 gap-2"
        disabled={disabled}
        aria-label={`Select ${traitName} level`}
        aria-describedby={describedById}
      >
        <ToggleGroupItem
          value="low"
          className={`data-[state=on]:bg-primary data-[state=on]:text-primary-foreground ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={disabled}
          aria-label={`Low ${traitName}`}
        >
          Low
        </ToggleGroupItem>
        <ToggleGroupItem
          value="high"
          className={`data-[state=on]:bg-primary data-[state=on]:text-primary-foreground ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={disabled}
          aria-label={`High ${traitName}`}
        >
          High
        </ToggleGroupItem>
      </ToggleGroup>
    </fieldset>
  )
}
