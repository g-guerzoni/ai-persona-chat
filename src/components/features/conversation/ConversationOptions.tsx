"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

export interface ConversationOption {
  id: string
  label: string
}

export interface ConversationOptionsProps {
  options: ConversationOption[]
  onSend?: (optionId: string) => void
  onProcessingChange?: (isProcessing: boolean) => void
}

// Ghost/skeleton option component
function GhostOption() {
  return (
    <div className="border-input flex min-h-[60px] animate-pulse items-center gap-3 rounded-md border p-4">
      <div className="bg-muted h-4 w-4 shrink-0 rounded-full" />
      <div className="bg-muted h-5 w-full max-w-[80%] rounded" />
    </div>
  )
}

export function ConversationOptions({
  options,
  onSend,
  onProcessingChange,
}: ConversationOptionsProps) {
  const [selected, setSelected] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOptionSelect = (optionId: string) => {
    if (isProcessing) return

    setSelected(optionId)
    setIsProcessing(true)
    onProcessingChange?.(true)
    onSend?.(optionId)

    // Reset after sending
    setTimeout(() => {
      setSelected("")
      setIsProcessing(false)
      onProcessingChange?.(false)
    }, 600)
  }

  return (
    <div className="border-border flex shrink-0 flex-col gap-4 border-t p-4">
      {isProcessing ? (
        <div className="flex flex-col gap-3">
          <GhostOption />
          <GhostOption />
          <GhostOption />
        </div>
      ) : (
        <RadioGroup
          value={selected}
          onValueChange={handleOptionSelect}
          className="flex flex-col gap-3"
        >
          {options.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className="border-input hover:border-primary flex min-h-[60px] cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors"
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <span className="flex-1 text-base">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}
