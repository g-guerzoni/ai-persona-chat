"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface OceanValues {
  openness: "low" | "high"
  conscientiousness: "low" | "high"
  extraversion: "low" | "high"
  agreeableness: "low" | "high"
  neuroticism: "low" | "high"
}

export interface SettingsContextType {
  tone: string
  oceanValues: OceanValues
  setTone: (tone: string) => void
  setOceanValues: (values: OceanValues) => void
}

const defaultOceanValues: OceanValues = {
  openness: "low",
  conscientiousness: "low",
  extraversion: "low",
  agreeableness: "low",
  neuroticism: "low",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [tone, setTone] = useState("friendly")
  const [oceanValues, setOceanValues] = useState<OceanValues>(defaultOceanValues)

  return (
    <SettingsContext.Provider value={{ tone, oceanValues, setTone, setOceanValues }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
