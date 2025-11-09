"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface OceanSliderProps {
  label: string
  value: "low" | "high"
  onValueChange: (value: "low" | "high") => void
}

export function OceanSlider({ label, value, onValueChange }: OceanSliderProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-primary text-lg font-medium">{label}</span>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="flex w-full items-center justify-between"
      >
        <div className="flex flex-col items-center gap-2">
          <RadioGroupItem value="low" id={`${label}-low`} />
          <Label htmlFor={`${label}-low`} className="cursor-pointer">
            Low
          </Label>
        </div>
        <div className="bg-border h-px w-full" />
        <div className="flex flex-col items-center gap-2">
          <RadioGroupItem value="high" id={`${label}-high`} />
          <Label htmlFor={`${label}-high`} className="cursor-pointer">
            High
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
