"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatContainer } from "@/components/features/chat/ChatContainer"
import { SettingsPanel } from "@/components/features/settings/SettingsPanel"
import { ConversationOptions } from "@/components/features/conversation/ConversationOptions"
import { Header } from "@/components/features/navigation/Header"
import { useAuth } from "@/hooks/useAuth"
import { useConversation } from "@/hooks/useConversation"
import { useState, useEffect, useRef } from "react"
import { Square, Diamond, Circle } from "lucide-react"
import type { ScenarioMetadata, InitialMessages, ConversationTreeNode } from "@/types/conversation"

// Import fixture data
import serviceMetadata from "@/fixtures/service-metadata.json"
import serviceConversation from "@/fixtures/service-conversation.json"
import caseMetadata from "@/fixtures/case-metadata.json"
import caseConversation from "@/fixtures/case-conversation.json"
import subjectMetadata from "@/fixtures/subject-metadata.json"
import subjectConversation from "@/fixtures/subject-conversation.json"
import notesMetadata from "@/fixtures/notes-metadata.json"
import notesConversation from "@/fixtures/notes-conversation.json"

// Scenario cache type
interface ScenarioData {
  metadata: ScenarioMetadata
  initialMessages: InitialMessages
  conversationTree: ConversationTreeNode[]
}

// Map tab IDs to scenario data
const SCENARIO_MAP: Record<string, ScenarioData> = {
  service: {
    metadata: serviceMetadata.metadata as ScenarioMetadata,
    initialMessages: serviceMetadata.initialMessages as InitialMessages,
    conversationTree: serviceConversation.conversationTree as ConversationTreeNode[],
  },
  case: {
    metadata: caseMetadata.metadata as ScenarioMetadata,
    initialMessages: caseMetadata.initialMessages as InitialMessages,
    conversationTree: caseConversation.conversationTree as ConversationTreeNode[],
  },
  subject: {
    metadata: subjectMetadata.metadata as ScenarioMetadata,
    initialMessages: subjectMetadata.initialMessages as InitialMessages,
    conversationTree: subjectConversation.conversationTree as ConversationTreeNode[],
  },
  notes: {
    metadata: notesMetadata.metadata as ScenarioMetadata,
    initialMessages: notesMetadata.initialMessages as InitialMessages,
    conversationTree: notesConversation.conversationTree as ConversationTreeNode[],
  },
}

// Tab component to handle individual conversation
function ConversationTab({
  scenarioId,
  onScoreUpdate,
  isAuthenticated,
}: {
  scenarioId: string
  onScoreUpdate?: (scores: { clarity: number; friendly: number; empathy: number }) => void
  isAuthenticated: boolean
}) {
  const scenario = SCENARIO_MAP[scenarioId]
  const conversation = useConversation({
    metadata: scenario.metadata,
    initialMessages: scenario.initialMessages,
    conversationTree: scenario.conversationTree,
  })

  const [showSettings, setShowSettings] = useState(true)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hasReportedScoreRef = useRef(false)

  // Notify parent when conversation completes (only once)
  useEffect(() => {
    if (conversation.isComplete && !hasReportedScoreRef.current && onScoreUpdate) {
      onScoreUpdate(conversation.scores)
      hasReportedScoreRef.current = true
    }

    // Reset the flag when conversation is reset
    if (!conversation.isComplete && hasReportedScoreRef.current) {
      hasReportedScoreRef.current = false
    }
  }, [conversation.isComplete, conversation.scores, onScoreUpdate])

  // Media query detection
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

  return (
    <Card className="grid max-h-[calc(100vh-10rem)] min-h-[500px] w-full flex-1 grid-cols-1 overflow-hidden md:max-h-[calc(100vh-12rem)] md:min-h-[600px] md:grid-cols-[auto_1fr]">
      {/* Settings Panel (Desktop) */}
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
            metadata={conversation.metadata}
            settings={conversation.settings}
            onSettingsChange={conversation.updateSettings}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-col">
        <ChatContainer
          personaName={conversation.metadata?.personaName || "Loading..."}
          personaRole={conversation.metadata?.personaRole || ""}
          caseId={conversation.metadata?.callId}
          subject={conversation.metadata?.subject}
          notes={conversation.metadata?.notes}
          onSettingsToggle={toggleSettings}
          onNewConversation={conversation.resetConversation}
          messages={conversation.messages}
          showMobileSettings={showMobileSettings}
          isMobile={isMobile}
          metadata={conversation.metadata}
          settings={conversation.settings}
          onSettingsChange={conversation.updateSettings}
        />

        {/* Conversation Options or Completion Message */}
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
                    style={{ color: "oklch(0.65 0.22 180)", fill: "oklch(0.65 0.22 180)" }}
                    aria-hidden="true"
                  />
                  <span>Empathy: {conversation.scores.empathy}</span>
                </div>
              </div>
              <div>
                <span className="text-lg font-bold">
                  Total Score:{" "}
                  {conversation.scores.clarity +
                    conversation.scores.friendly +
                    conversation.scores.empathy}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <ConversationOptions
            options={conversation.currentOptions}
            onSend={(optionId) => {
              // Only allow sending if authenticated
              if (isAuthenticated) {
                conversation.selectOption(optionId)
              }
            }}
            disabled={false}
            isLocked={!isAuthenticated}
          />
        )}
      </div>
    </Card>
  )
}

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("service")
  const [cumulativeScores, setCumulativeScores] = useState({
    clarity: 0,
    friendly: 0,
    empathy: 0,
  })

  const handleScoreUpdate = (scores: { clarity: number; friendly: number; empathy: number }) => {
    setCumulativeScores((prev) => ({
      clarity: prev.clarity + scores.clarity,
      friendly: prev.friendly + scores.friendly,
      empathy: prev.empathy + scores.empathy,
    }))
  }

  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        userAvatar={user?.avatar}
        gamificationScores={{
          square: cumulativeScores.clarity,
          diamond: cumulativeScores.friendly,
          circle: cumulativeScores.empathy,
        }}
        onLogout={logout}
      />
      <main id="main-content" className="relative flex min-h-[calc(100vh-80px)] flex-col">
        <h1 className="sr-only">AI Persona Chat - Customer Service Training</h1>
        <section
          className="flex items-center justify-center overflow-hidden p-6 px-4"
          aria-label="Conversation scenarios"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full max-h-full w-[95%] flex-col md:w-[1100px]"
          >
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="w-full md:w-fit" aria-label="Scenario navigation">
                <TabsTrigger value="service" className="flex-1 md:flex-initial">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="case" className="flex-1 md:flex-initial">
                  Technical Support
                </TabsTrigger>
                <TabsTrigger value="subject" className="flex-1 md:flex-initial">
                  Account Access
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 md:flex-initial">
                  Product Complaint
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="service" className="m-0 flex h-full flex-col">
              <ConversationTab
                scenarioId="service"
                onScoreUpdate={handleScoreUpdate}
                isAuthenticated={isAuthenticated}
              />
            </TabsContent>
            <TabsContent value="case" className="m-0 flex h-full flex-col">
              <ConversationTab
                scenarioId="case"
                onScoreUpdate={handleScoreUpdate}
                isAuthenticated={isAuthenticated}
              />
            </TabsContent>
            <TabsContent value="subject" className="m-0 flex h-full flex-col">
              <ConversationTab
                scenarioId="subject"
                onScoreUpdate={handleScoreUpdate}
                isAuthenticated={isAuthenticated}
              />
            </TabsContent>
            <TabsContent value="notes" className="m-0 flex h-full flex-col">
              <ConversationTab
                scenarioId="notes"
                onScoreUpdate={handleScoreUpdate}
                isAuthenticated={isAuthenticated}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </>
  )
}
