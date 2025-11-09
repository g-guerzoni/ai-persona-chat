"use client"

import { OceanSlider } from "./OceanSlider"

export interface OceanValues {
  openness: "low" | "high"
  conscientiousness: "low" | "high"
  extraversion: "low" | "high"
  agreeableness: "low" | "high"
  neuroticism: "low" | "high"
}

export interface OceanControlsProps {
  values: OceanValues
  onValuesChange: (values: OceanValues) => void
}

export function OceanControls({ values, onValuesChange }: OceanControlsProps) {
  const handleChange = (key: keyof OceanValues) => (value: "low" | "high") => {
    onValuesChange({ ...values, [key]: value })
  }

  return (
    <div className="flex flex-col gap-6">
      <OceanSlider
        label="Openness"
        value={values.openness}
        onValueChange={handleChange("openness")}
      />
      <OceanSlider
        label="Conscientiousness"
        value={values.conscientiousness}
        onValueChange={handleChange("conscientiousness")}
      />
      <OceanSlider
        label="Extraversion"
        value={values.extraversion}
        onValueChange={handleChange("extraversion")}
      />
      <OceanSlider
        label="Agreeableness"
        value={values.agreeableness}
        onValueChange={handleChange("agreeableness")}
      />
      <OceanSlider
        label="Neuroticism"
        value={values.neuroticism}
        onValueChange={handleChange("neuroticism")}
      />
    </div>
  )
}
