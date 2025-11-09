import type {
  ConversationNode,
  ResponseNode,
  ConversationOption,
  OptionTextVariants,
} from "@/types/conversation"

/**
 * Maps tone and trait levels to variant key format
 * @example getVariantKey('friendly', 'low', 'high') => 'friendly-low-high'
 */
export function getVariantKey(
  tone: "friendly" | "professional",
  primaryLevel: "low" | "high",
  secondaryLevel: "low" | "high"
): keyof OptionTextVariants {
  return `${tone}-${primaryLevel}-${secondaryLevel}` as keyof OptionTextVariants
}

/**
 * Extracts the correct text variant from an option based on current settings
 */
export function getOptionText(
  option: ConversationOption,
  tone: "friendly" | "professional",
  primaryLevel: "low" | "high",
  secondaryLevel: "low" | "high"
): string {
  const key = getVariantKey(tone, primaryLevel, secondaryLevel)
  return option.text[key]
}

/**
 * Finds a node by ID in the conversation tree
 */
export function findNodeById(
  tree: (ConversationNode | ResponseNode)[],
  nodeId: string
): ConversationNode | ResponseNode | null {
  return tree.find((node) => node.id === nodeId) || null
}

/**
 * Checks if the conversation has reached completion
 */
export function isConversationComplete(nodeId: string): boolean {
  return nodeId === "complete"
}

/**
 * Gets the next node based on current node and selected option
 */
export function getNextNode(
  tree: (ConversationNode | ResponseNode)[],
  currentNode: ConversationNode,
  selectedOptionId: string
): ResponseNode | null {
  const option = currentNode.options.find((opt) => opt.id === selectedOptionId)
  if (!option) return null

  const nextNode = findNodeById(tree, option.nextNodeId)
  return nextNode && "type" in nextNode && nextNode.type === "ai_response"
    ? (nextNode as ResponseNode)
    : null
}

/**
 * Gets the conversation node that follows a response node
 */
export function getConversationNodeAfterResponse(
  tree: (ConversationNode | ResponseNode)[],
  responseNode: ResponseNode
): ConversationNode | null {
  if (isConversationComplete(responseNode.nextNodeId)) {
    return null
  }

  const nextNode = findNodeById(tree, responseNode.nextNodeId)
  return nextNode && !("type" in nextNode) ? (nextNode as ConversationNode) : null
}

/**
 * Calculates cumulative scores from a list of selected options
 */
export function calculateCumulativeScores(selectedOptions: ConversationOption[]): {
  clarity: number
  friendly: number
  empathy: number
} {
  return selectedOptions.reduce(
    (totals, option) => ({
      clarity: totals.clarity + option.scores.clarity,
      friendly: totals.friendly + option.scores.friendly,
      empathy: totals.empathy + option.scores.empathy,
    }),
    { clarity: 0, friendly: 0, empathy: 0 }
  )
}
