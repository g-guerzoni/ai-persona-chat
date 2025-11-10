"use client"

import { Card } from "@/components/ui/card"
import { ChatContainer } from "@/components/features/chat/ChatContainer"
import { SettingsPanel } from "@/components/features/settings/SettingsPanel"
import { ConversationOptions } from "@/components/features/conversation/ConversationOptions"
import { useConversationAPI } from "@/hooks/useConversationAPI"
import { useState, useEffect, useRef } from "react"
import { Square, Diamond, Circle } from "lucide-react"

export interface ConversationTabProps {
  scenarioSlug: string
  onScoreUpdate?: (scores: { clarity: number; friendly: number; empathy: number }) => void
  isAuthenticated: boolean
}

export function ConversationTab({
  scenarioSlug,
  onScoreUpdate,
  isAuthenticated,
}: ConversationTabProps) {
  const conversation = useConversationAPI({
    scenarioSlug,
    isAuthenticated,
  })

  const [showSettings, setShowSettings] = useState(true)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hasReportedScoreRef = useRef(false)

  useEffect(() => {
    if (conversation.isComplete && !hasReportedScoreRef.current && onScoreUpdate) {
      onScoreUpdate({
        clarity: conversation.scores.clarity,
        friendly: conversation.scores.friendly,
        empathy: conversation.scores.empathy,
      })
      hasReportedScoreRef.current = true
    }

    if (!conversation.isComplete && hasReportedScoreRef.current) {
      hasReportedScoreRef.current = false
    }
  }, [conversation.isComplete, conversation.scores, onScoreUpdate])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSettings = () => {
    if (isMobile) {
      setShowMobileSettings((prev) => !prev)
    } else {
      setShowSettings((prev) => !prev)
    }
  }

  const metadata = conversation.metadata

  return (
    <Card className="grid max-h-[calc(100vh-10rem)] min-h-[500px] w-full flex-1 grid-cols-1 overflow-hidden md:max-h-[calc(100vh-12rem)] md:min-h-[600px] md:grid-cols-[auto_1fr]">
      <div
        className={`border-border hidden min-w-0 flex-col overflow-hidden border-r transition-all duration-300 ease-in-out md:flex ${
          showSettings ? "w-[275px]" : "w-0"
        }`}
      >
        <div
          className={`flex-1 overflow-y-auto transition-opacity duration-300 ${
            showSettings ? "opacity-100" : "opacity-0"
          }`}
        >
          <SettingsPanel
            metadata={metadata}
            settings={conversation.settings}
            onSettingsChange={conversation.updateSettings}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <ChatContainer
          personaName={metadata?.personaName || "Loading..."}
          personaRole={metadata?.personaRole || ""}
          caseId={metadata?.callId}
          subject={metadata?.subject}
          notes={metadata?.notes}
          onSettingsToggle={toggleSettings}
          onNewConversation={conversation.resetConversation}
          messages={conversation.messages}
          showMobileSettings={showMobileSettings}
          isMobile={isMobile}
          metadata={metadata}
          settings={conversation.settings}
          onSettingsChange={conversation.updateSettings}
        />

        {conversation.error && (
          <div className="border-border bg-destructive/10 text-destructive flex shrink-0 items-center justify-center border-t p-4 text-sm">
            Error: {conversation.error}
          </div>
        )}

        {conversation.isComplete ? (
          <div
            className="border-border flex shrink-0 flex-col border-t p-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <h2 className="text-base font-semibold">Conversation Completed!</h2>
              <div className="flex items-center gap-4 text-sm" aria-label="Score breakdown">
                <div className="flex items-center gap-1">
                  <Square
                    className="h-4 w-4"
                    style={{ color: "oklch(0.65 0.22 60)", fill: "oklch(0.65 0.22 60)" }}
                    aria-hidden="true"
                  />
                  <span>Clarity: {conversation.scores.clarity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Diamond
                    className="h-4 w-4"
                    style={{ color: "oklch(0.7 0.2 140)", fill: "oklch(0.7 0.2 140)" }}
                    aria-hidden="true"
                  />
                  <span>Friendly: {conversation.scores.friendly}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Circle
                    className="h-4 w-4"
                    style={{ color: "oklch(0.65 0.22 240)", fill: "oklch(0.65 0.22 240)" }}
                    aria-hidden="true"
                  />
                  <span>Empathy: {conversation.scores.empathy}</span>
                </div>
              </div>
              <div>
                <span className="text-lg font-bold">Total Score: {conversation.scores.total}</span>
              </div>
            </div>
          </div>
        ) : (
          <ConversationOptions
            options={conversation.currentOptions}
            onSend={(optionId) => {
              if (isAuthenticated) {
                conversation.selectOption(optionId)
              }
            }}
            disabled={conversation.isLoading}
            isLocked={!isAuthenticated}
            isLoading={conversation.isLoading}
          />
        )}
      </div>
    </Card>
  )
}
