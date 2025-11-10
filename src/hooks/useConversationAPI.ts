import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import type { ScenarioMetadata } from "@/types/conversation"
import { METADATA_MAP } from "@/data/metadata"

export interface ConversationSettings {
  tone: "friendly" | "professional"
  primaryLevel: "low" | "high"
  secondaryLevel: "low" | "high"
  isLocked: boolean
}

export interface ChatMessage {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: number
  scores?: {
    clarity: number
    friendly: number
    empathy: number
  }
}

export interface DisplayOption {
  id: string
  text: string
  order_index?: number
  scores: {
    clarity: number
    friendly: number
    empathy: number
  }
}

interface UseConversationAPIProps {
  scenarioSlug: string
  isAuthenticated: boolean
}

export function useConversationAPI({ scenarioSlug, isAuthenticated }: UseConversationAPIProps) {
  const [settings, setSettings] = useState<ConversationSettings>({
    tone: "friendly",
    primaryLevel: "low",
    secondaryLevel: "low",
    isLocked: false,
  })

  const fixtureData = METADATA_MAP[scenarioSlug]
  const metadata: ScenarioMetadata | null = fixtureData?.metadata || null
  const initialMessageContent = fixtureData?.initialMessages?.initialMessage?.content || ""

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial",
      role: "ai",
      content: initialMessageContent,
      timestamp: Date.now(),
    },
  ])
  const [currentOptions, setCurrentOptions] = useState<DisplayOption[]>(() =>
    (fixtureData?.initialOptions || []).map((opt) => ({
      id: opt.id,
      text: opt.text,
      scores: { clarity: 0, friendly: 0, empathy: 0 },
    }))
  )
  const [scores, setScores] = useState({
    clarity: 0,
    friendly: 0,
    empathy: 0,
    total: 0,
  })
  const [isComplete, setIsComplete] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    fixtureData ? null : `Scenario "${scenarioSlug}" not found`
  )

  const updateSettings = useCallback(
    (newSettings: Partial<ConversationSettings>) => {
      if (settings.isLocked) return

      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }))
    },
    [settings.isLocked]
  )

  const selectOption = useCallback(
    async (optionId: string) => {
      if (!isAuthenticated) return

      const selectedOption = currentOptions.find((opt) => opt.id === optionId)
      if (!selectedOption) return

      const selectedText = selectedOption.text

      setIsLoading(true)
      setError(null)

      if (!settings.isLocked) {
        setSettings((prev) => ({ ...prev, isLocked: true }))
      }

      const { data, error: apiError } = await apiClient.selectOption({
        conversation_id: conversationId,
        option_id: optionId,
        scenario_slug: !conversationId ? scenarioSlug : undefined,
        tone: !conversationId ? settings.tone : undefined,
        primary_level: !conversationId ? settings.primaryLevel : undefined,
        secondary_level: !conversationId ? settings.secondaryLevel : undefined,
      })

      if (apiError) {
        setError(apiError)
        setIsLoading(false)
        if (!conversationId) {
          setSettings((prev) => ({ ...prev, isLocked: false }))
        }
        return
      }

      if (data) {
        if (!conversationId && data.conversation_id) {
          setConversationId(data.conversation_id)
        }

        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: selectedText,
          timestamp: Date.now(),
          scores: data.step_scores,
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: data.ai_response,
          timestamp: Date.now() + 1,
        }

        setMessages((prev) => [...prev, userMessage, aiMessage])
        setScores(data.cumulative_scores)
        setIsComplete(data.is_completed)

        if (data.next_options) {
          setCurrentOptions(
            data.next_options.map((opt) => ({
              ...opt,
              scores: { clarity: 0, friendly: 0, empathy: 0 },
            }))
          )
        } else {
          setCurrentOptions([])
        }

        if (data.is_completed && (conversationId || data.conversation_id)) {
          await apiClient.updateScores(conversationId || data.conversation_id!)
        }
      }

      setIsLoading(false)
    },
    [
      conversationId,
      isAuthenticated,
      currentOptions,
      scenarioSlug,
      settings.tone,
      settings.primaryLevel,
      settings.secondaryLevel,
      settings.isLocked,
    ]
  )

  const resetConversation = useCallback(() => {
    const initialMessage: ChatMessage = {
      id: "initial",
      role: "ai",
      content: initialMessageContent,
      timestamp: Date.now(),
    }

    setMessages([initialMessage])
    setCurrentOptions(
      (fixtureData?.initialOptions || []).map((opt) => ({
        id: opt.id,
        text: opt.text,
        scores: { clarity: 0, friendly: 0, empathy: 0 },
      }))
    )
    setConversationId(null)
    setScores({ clarity: 0, friendly: 0, empathy: 0, total: 0 })
    setIsComplete(false)
    setSettings({
      tone: "friendly",
      primaryLevel: "low",
      secondaryLevel: "low",
      isLocked: false,
    })
  }, [initialMessageContent, fixtureData])

  return {
    metadata,
    messages,
    currentOptions,
    settings,
    scores,
    isComplete,

    isLoading,
    error,

    updateSettings,
    selectOption,
    resetConversation,
  }
}
