export interface OceanTraits {
  openness: number // 0-100
  conscientiousness: number // 0-100
  extraversion: number // 0-100
  agreeableness: number // 0-100
  neuroticism: number // 0-100
}

export type OceanTraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism"

export interface ScenarioMetadata {
  personaName: string
  personaRole: string
  callId: string // 6-digit identifier
  service: string
  subject: string
  notes: string
  oceanTraits: OceanTraits
  primaryTrait: OceanTraitKey // Primary trait that affects option text variants
  secondaryTrait: OceanTraitKey // Secondary trait that affects option text variants
}

export interface InitialMessages {
  systemMessage: string
  initialMessage: {
    role: "ai"
    content: string
  }
}

export interface OptionTextVariants {
  "friendly-low-low": string // tone-primary-secondary
  "friendly-low-high": string
  "friendly-high-low": string
  "friendly-high-high": string
  "professional-low-low": string
  "professional-low-high": string
  "professional-high-low": string
  "professional-high-high": string
}

export interface OptionScores {
  clarity: number // -1, 0, 1, or 2
  friendly: number // -1, 0, 1, or 2
  empathy: number // -1, 0, 1, or 2
}

export interface ConversationOption {
  id: string
  text: OptionTextVariants
  scores: OptionScores
  nextNodeId: string
}

export interface ConversationNode {
  id: string
  level: number // 0-3
  options: ConversationOption[]
}

export interface ResponseNode {
  id: string
  type: "ai_response"
  content: string
  nextNodeId: string
}

export type ConversationTreeNode = ConversationNode | ResponseNode

export interface ConversationScenario {
  metadata: ScenarioMetadata
  initialMessages: InitialMessages
  conversationTree: ConversationTreeNode[]
}

// Helper type guards
export function isConversationNode(node: ConversationTreeNode): node is ConversationNode {
  return "options" in node
}

export function isResponseNode(node: ConversationTreeNode): node is ResponseNode {
  return "type" in node && node.type === "ai_response"
}
