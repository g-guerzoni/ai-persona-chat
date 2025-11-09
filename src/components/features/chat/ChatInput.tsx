"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
}

export function ChatInput({ onSend, placeholder = "Type a message..." }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-border flex flex-col gap-2 border-t p-4">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-ring flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          rows={3}
        />
        <Button onClick={handleSend} className="shrink-0">
          Send
        </Button>
      </div>
    </div>
  )
}
