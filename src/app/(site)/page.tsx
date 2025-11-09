"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatContainer } from "@/components/features/chat/ChatContainer"
import { SettingsPanel } from "@/components/features/settings/SettingsPanel"
import {
  ConversationOptions,
  type ConversationOption,
} from "@/components/features/conversation/ConversationOptions"
import { Header } from "@/components/features/navigation/Header"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import type { ChatMessageProps } from "@/components/features/chat/ChatMessage"

// Sample conversation options for demonstration
const conversationOptions: ConversationOption[] = [
  { id: "opt1", label: "Option 1: Tell me about your services" },
  { id: "opt2", label: "Option 2: Help me with a specific case" },
  { id: "opt3", label: "Option 3: General inquiry" },
]

type TabMessages = {
  [key: string]: ChatMessageProps[]
}

export default function HomePage() {
  const { isAuthenticated, user, logout, login } = useAuth()
  const [activeTab, setActiveTab] = useState("service")
  const [showSettings, setShowSettings] = useState(true)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [tabMessages, setTabMessages] = useState<TabMessages>({
    service: [],
    case: [],
    subject: [],
    notes: [],
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Media query detection for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleOptionSend = (optionId: string) => {
    const option = conversationOptions.find((opt) => opt.id === optionId)
    if (!option) return

    // Add user message
    setTabMessages((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { content: option.label, type: "user" }],
    }))

    // Simulate AI response
    setTimeout(() => {
      setTabMessages((prev) => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          {
            content: "This is a placeholder AI response. Actual AI integration not implemented.",
            type: "ai",
          },
        ],
      }))
    }, 500)
  }

  const toggleSettings = () => {
    if (isMobile) {
      setShowMobileSettings((prev) => !prev)
    } else {
      setShowSettings((prev) => !prev)
    }
  }

  const handleSignin = () => {
    // Mock signin with dummy credentials
    login("user@example.com", "password")
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        userAvatar={user?.avatar}
        gamificationScores={{
          square: 1,
          diamond: 1,
          circle: 1,
        }}
        onLogout={logout}
        onSignin={handleSignin}
      />
      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4 md:py-8">
        <Tabs
          defaultValue="service"
          onValueChange={setActiveTab}
          className="flex h-full max-h-full w-[95%] flex-col md:w-[1100px]"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="w-full md:w-fit">
              <TabsTrigger value="service" className="flex-1 md:flex-initial">
                Service
              </TabsTrigger>
              <TabsTrigger value="case" className="flex-1 md:flex-initial">
                Case
              </TabsTrigger>
              <TabsTrigger value="subject" className="flex-1 md:flex-initial">
                Subject
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 md:flex-initial">
                Notes
              </TabsTrigger>
            </TabsList>
          </div>

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
                <SettingsPanel />
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <TabsContent value="service" className="m-0 flex h-full flex-col overflow-hidden">
                <ChatContainer
                  personaName="AI Assistant"
                  personaRole="Service Specialist"
                  onSettingsToggle={toggleSettings}
                  messages={tabMessages.service}
                  isProcessing={isProcessing}
                  showMobileSettings={showMobileSettings}
                  isMobile={isMobile}
                />
                <ConversationOptions
                  options={conversationOptions}
                  onSend={handleOptionSend}
                  onProcessingChange={setIsProcessing}
                />
              </TabsContent>
              <TabsContent value="case" className="m-0 flex h-full flex-col overflow-hidden">
                <ChatContainer
                  personaName="AI Assistant"
                  personaRole="Case Manager"
                  onSettingsToggle={toggleSettings}
                  messages={tabMessages.case}
                  isProcessing={isProcessing}
                  showMobileSettings={showMobileSettings}
                  isMobile={isMobile}
                />
                <ConversationOptions
                  options={conversationOptions}
                  onSend={handleOptionSend}
                  onProcessingChange={setIsProcessing}
                />
              </TabsContent>
              <TabsContent value="subject" className="m-0 flex h-full flex-col overflow-hidden">
                <ChatContainer
                  personaName="AI Assistant"
                  personaRole="Subject Matter Expert"
                  onSettingsToggle={toggleSettings}
                  messages={tabMessages.subject}
                  isProcessing={isProcessing}
                  showMobileSettings={showMobileSettings}
                  isMobile={isMobile}
                />
                <ConversationOptions
                  options={conversationOptions}
                  onSend={handleOptionSend}
                  onProcessingChange={setIsProcessing}
                />
              </TabsContent>
              <TabsContent value="notes" className="m-0 flex h-full flex-col overflow-hidden">
                <ChatContainer
                  personaName="AI Assistant"
                  personaRole="Note Taker"
                  onSettingsToggle={toggleSettings}
                  messages={tabMessages.notes}
                  isProcessing={isProcessing}
                  showMobileSettings={showMobileSettings}
                  isMobile={isMobile}
                />
                <ConversationOptions
                  options={conversationOptions}
                  onSend={handleOptionSend}
                  onProcessingChange={setIsProcessing}
                />
              </TabsContent>
            </div>
          </Card>
        </Tabs>
      </div>
    </main>
  )
}
