"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { Lock } from "lucide-react"
import Link from "next/link"
import type { DisplayOption } from "@/hooks/useConversation"

export interface ConversationOptionsProps {
  options: DisplayOption[]
  onSend?: (optionId: string) => void
  disabled?: boolean
  isLocked?: boolean
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
  disabled = false,
  isLocked = false,
}: ConversationOptionsProps) {
  const [selected, setSelected] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOptionSelect = (optionId: string) => {
    if (isProcessing || disabled || isLocked) return

    setSelected(optionId)
    setIsProcessing(true)
    onSend?.(optionId)

    // Reset after sending
    setTimeout(() => {
      setSelected("")
      setIsProcessing(false)
    }, 600)
  }

  // Show ghost options while processing
  if (isProcessing) {
    return (
      <section
        className="border-border flex shrink-0 flex-col gap-4 border-t p-4"
        aria-label="Response options"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col gap-3">
          <GhostOption />
          <GhostOption />
        </div>
      </section>
    )
  }

  // Show nothing if no options or disabled
  if (options.length === 0 || disabled) {
    return null
  }

  return (
    <section
      className="border-border relative flex shrink-0 flex-col gap-4 border-t p-4"
      aria-label="Response options"
    >
      {/* Lock overlay when not authenticated */}
      {isLocked && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
        >
          <div className="bg-background/95 border-primary flex flex-col items-center gap-2 rounded-lg border-2 p-4 shadow-lg">
            <Lock className="text-primary h-8 w-8" aria-hidden="true" />
            <p id="login-prompt-title" className="text-center text-sm font-medium" role="alert">
              Sign in to participate
            </p>
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      <fieldset disabled={isLocked}>
        <legend className="sr-only">Select your response</legend>
        <RadioGroup
          value={selected}
          onValueChange={handleOptionSelect}
          className="flex flex-col gap-3"
          disabled={isLocked}
          aria-label="Choose your response from the options below"
        >
          {options.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={`border-input hover:border-primary flex min-h-[60px] items-center gap-3 rounded-md border p-4 transition-colors ${
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <RadioGroupItem value={option.id} id={option.id} disabled={isLocked} />
              <span className="flex-1 text-base">{option.text}</span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>
    </section>
  )
}
