import { useState, useCallback, useMemo } from "react"
import type {
  ScenarioMetadata,
  InitialMessages,
  ConversationTreeNode,
  ConversationNode,
  ResponseNode,
  ConversationOption,
} from "@/types/conversation"
import {
  findNodeById,
  getOptionText,
  getNextNode,
  getConversationNodeAfterResponse,
  calculateCumulativeScores,
  isConversationComplete,
} from "@/lib/conversationHelpers"

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
  scores: {
    clarity: number
    friendly: number
    empathy: number
  }
}

interface UseConversationProps {
  metadata: ScenarioMetadata | null
  initialMessages: InitialMessages | null
  conversationTree: ConversationTreeNode[] | null
}

export function useConversation({
  metadata,
  initialMessages,
  conversationTree,
}: UseConversationProps) {
  // Settings state
  const [settings, setSettings] = useState<ConversationSettings>({
    tone: "friendly",
    primaryLevel: "low",
    secondaryLevel: "low",
    isLocked: false,
  })

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string>("start")
  const [selectedOptions, setSelectedOptions] = useState<ConversationOption[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize conversation with initial AI message
  const initializeConversation = useCallback(() => {
    if (!initialMessages || isInitialized) return

    const initialAiMessage: ChatMessage = {
      id: "initial",
      role: "ai",
      content: initialMessages.initialMessage.content,
      timestamp: Date.now(),
    }

    setMessages([initialAiMessage])
    setIsInitialized(true)
  }, [initialMessages, isInitialized])

  // Initialize when data is available
  if (initialMessages && !isInitialized) {
    initializeConversation()
  }

  // Get current conversation node
  const currentNode = useMemo((): ConversationNode | null => {
    if (!conversationTree) return null
    if (isConversationComplete(currentNodeId)) return null

    const node = findNodeById(conversationTree, currentNodeId)
    return node && "options" in node ? (node as ConversationNode) : null
  }, [conversationTree, currentNodeId])

  // Get display options with correct text variants
  const currentOptions = useMemo((): DisplayOption[] => {
    if (!currentNode) return []

    return currentNode.options.map((option) => ({
      id: option.id,
      text: getOptionText(option, settings.tone, settings.primaryLevel, settings.secondaryLevel),
      scores: option.scores,
    }))
  }, [currentNode, settings.tone, settings.primaryLevel, settings.secondaryLevel])

  // Calculate cumulative scores
  const scores = useMemo(() => calculateCumulativeScores(selectedOptions), [selectedOptions])

  // Check if conversation is complete
  const isComplete = isConversationComplete(currentNodeId)

  // Update settings (only when unlocked)
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

  // Handle option selection
  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentNode || !conversationTree) return

      // Find the full option object
      const selectedOption = currentNode.options.find((opt) => opt.id === optionId)
      if (!selectedOption) return

      // Lock settings on first message
      if (!settings.isLocked) {
        setSettings((prev) => ({ ...prev, isLocked: true }))
      }

      // Get the display text for user message
      const userMessageText = getOptionText(
        selectedOption,
        settings.tone,
        settings.primaryLevel,
        settings.secondaryLevel
      )

      // Add user message with scores
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessageText,
        timestamp: Date.now(),
        scores: selectedOption.scores,
      }

      // Record the selected option for scoring
      setSelectedOptions((prev) => [...prev, selectedOption])

      // Navigate to AI response node
      const responseNode = getNextNode(conversationTree, currentNode, optionId)

      if (!responseNode) return

      // Add AI response message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: responseNode.content,
        timestamp: Date.now() + 1,
      }

      // Update messages
      setMessages((prev) => [...prev, userMessage, aiMessage])

      // Navigate to next conversation node or complete
      if (isConversationComplete(responseNode.nextNodeId)) {
        setCurrentNodeId("complete")
      } else {
        const nextConversationNode = getConversationNodeAfterResponse(
          conversationTree,
          responseNode
        )

        if (nextConversationNode) {
          setCurrentNodeId(nextConversationNode.id)
        } else {
          setCurrentNodeId("complete")
        }
      }
    },
    [currentNode, conversationTree, settings]
  )

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (!initialMessages) return

    const initialAiMessage: ChatMessage = {
      id: "initial",
      role: "ai",
      content: initialMessages.initialMessage.content,
      timestamp: Date.now(),
    }

    setMessages([initialAiMessage])
    setCurrentNodeId("start")
    setSelectedOptions([])
    setSettings({
      tone: "friendly",
      primaryLevel: "low",
      secondaryLevel: "low",
      isLocked: false,
    })
  }, [initialMessages])

  return {
    // Data
    metadata,
    messages,
    currentOptions,
    settings,
    scores,
    isComplete,

    // Actions
    updateSettings,
    selectOption,
    resetConversation,
  }
}
