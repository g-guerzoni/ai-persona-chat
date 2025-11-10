/**
 * Shared TypeScript types for Edge Functions
 */

// =============================================
// Database Row Types
// =============================================

export interface Scenario {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  order_index: number
  is_active: boolean
  primary_trait?: string
  secondary_trait?: string
  created_at: string
  updated_at: string
}

export interface ConversationNode {
  id: string
  scenario_id: string
  node_key: string
  node_type: "conversation" | "response" | "end"
  level: number | null
  ai_response_content: string | null
  next_node_key: string | null
  created_at: string
  updated_at: string
}

export interface ConversationOption {
  id: string
  node_id: string
  option_key: string
  order_index: number
  score_clarity: number
  score_friendly: number
  score_empathy: number
  next_node_key: string
  created_at: string
  updated_at: string
}

export interface OptionTextVariant {
  id: string
  option_id: string
  variant_key: string
  text_content: string
  tone: "friendly" | "professional"
  primary_level: "low" | "high"
  secondary_level: "low" | "high"
  created_at: string
}

export interface UserConversation {
  id: string
  user_id: string
  scenario_id: string
  current_node_key: string
  is_completed: boolean
  user_tone: "friendly" | "professional"
  user_primary_level: "low" | "high"
  user_secondary_level: "low" | "high"
  final_score_clarity: number
  final_score_friendly: number
  final_score_empathy: number
  final_total_score: number
  outcome_level: "very_high" | "high" | "medium" | "low" | null
  started_at: string
  completed_at: string | null
  updated_at: string
}

export interface ConversationHistory {
  id: string
  conversation_id: string
  step_number: number
  node_key: string
  node_type: string
  selected_option_id: string | null
  selected_option_key: string | null
  selected_text_variant: string | null
  selected_text_content: string | null
  ai_response_content: string | null
  step_score_clarity: number
  step_score_friendly: number
  step_score_empathy: number
  cumulative_score_clarity: number
  cumulative_score_friendly: number
  cumulative_score_empathy: number
  cumulative_total_score: number
  created_at: string
}

export interface UserScore {
  id: string
  user_id: string
  scenario_id: string
  best_clarity_score: number
  best_friendly_score: number
  best_empathy_score: number
  best_total_score: number
  best_outcome_level: string | null
  avg_clarity_score: number
  avg_friendly_score: number
  avg_empathy_score: number
  avg_total_score: number
  attempts_count: number
  completed_count: number
  last_attempt_at: string | null
  created_at: string
  updated_at: string
}

// =============================================
// API Request/Response Types
// =============================================

export interface GetScenariosResponse {
  scenarios: Array<{
    id: string
    slug: string
    title: string
    icon: string | null
    order_index: number
  }>
}

export interface StartConversationRequest {
  scenario_slug: string
  tone: "friendly" | "professional"
  primary_level: "low" | "high"
  secondary_level: "low" | "high"
}

export interface StartConversationResponse {
  conversation_id: string
  initial_options: Array<{
    id: string
    text: string
    order_index: number
  }>
}

export interface SelectOptionRequest {
  conversation_id?: string | null
  option_id: string
  // Optional fields for auto-creating conversation on first selection
  scenario_slug?: string
  tone?: "friendly" | "professional"
  primary_level?: "low" | "high"
  secondary_level?: "low" | "high"
}

export interface SelectOptionResponse {
  conversation_id: string // Always return ID (for first selection or existing)
  ai_response: string
  next_options: Array<{
    id: string
    text: string
    order_index: number
  }> | null
  step_scores: {
    clarity: number
    friendly: number
    empathy: number
  }
  cumulative_scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
  is_completed: boolean
  outcome_level?: "very_high" | "high" | "medium" | "low"
}

export interface GetScoresRequest {
  scenario_slug: string
}

export interface GetScoresResponse {
  best_scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
    outcome_level: string | null
  }
  average_scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
  statistics: {
    attempts: number
    completed: number
    last_attempt: string | null
  }
}
