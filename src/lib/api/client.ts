/**
 * API Client for Supabase Edge Functions
 * Handles all API calls to the backend
 */

import { createClient } from "@/lib/supabase/client"

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : ""

// =============================================
// Type Definitions
// =============================================

export interface ScenarioMetadata {
  persona_name: string
  persona_role: string
  call_id: string
  service: string
  subject: string
  notes: string | null
  primary_trait: string
  secondary_trait: string
  system_message: string
  initial_message: string
}

export interface ConversationOption {
  id: string
  text: string
  order_index: number
}

export interface StartConversationParams {
  scenario_slug: string
  tone: "friendly" | "professional"
  primary_level: "low" | "high"
  secondary_level: "low" | "high"
}

export interface SelectOptionParams {
  conversation_id: string | null
  option_id: string
  // Optional fields for first selection (when conversation doesn't exist)
  scenario_slug?: string
  tone?: "friendly" | "professional"
  primary_level?: "low" | "high"
  secondary_level?: "low" | "high"
}

export interface SelectOptionResult {
  conversation_id?: string // Returned on first selection
  ai_response: string
  next_options: ConversationOption[] | null
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

export interface UserScores {
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

// =============================================
// API Client Class
// =============================================

// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === "development"

class APIClient {
  private async getAuthToken(): Promise<string | null> {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const token = await this.getAuthToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const url = `${FUNCTIONS_URL}/${endpoint}`
      if (DEBUG) console.log(`[API] Calling: ${endpoint}`)

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (DEBUG) console.log(`[API] Response status: ${response.status}`)

      const json = await response.json()

      if (!response.ok) {
        console.error(`[API] Error on ${endpoint}:`, json.error || response.statusText)
        return {
          data: null,
          error: json.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      if (DEBUG) console.log(`[API] Success: ${endpoint}`)
      return { data: json as T, error: null }
    } catch (error) {
      console.error(
        `[API] Exception on ${endpoint}:`,
        error instanceof Error ? error.message : "Unknown error"
      )
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * POST /start-conversation
   * Starts a new conversation
   */
  async startConversation(params: StartConversationParams): Promise<{
    data: { conversation_id: string; initial_options: ConversationOption[] } | null
    error: string | null
  }> {
    return this.request<{ conversation_id: string; initial_options: ConversationOption[] }>(
      "start-conversation",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
  }

  /**
   * POST /select-option
   * Selects an option and gets the AI response
   */
  async selectOption(
    params: SelectOptionParams
  ): Promise<{ data: SelectOptionResult | null; error: string | null }> {
    return this.request<SelectOptionResult>("select-option", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * GET /get-scores?scenario_slug=<slug> (optional)
   * Fetches user scores
   * - If scenario_slug provided: scores for that specific scenario
   * - If no scenario_slug: total scores across all scenarios
   */
  async getScores(
    scenario_slug?: string
  ): Promise<{ data: UserScores | null; error: string | null }> {
    const url = scenario_slug
      ? `get-scores?scenario_slug=${encodeURIComponent(scenario_slug)}`
      : `get-scores`
    return this.request<UserScores>(url)
  }

  /**
   * POST /update-scores
   * Updates user scores after conversation completion
   */
  async updateScores(
    conversation_id: string
  ): Promise<{ data: { success: boolean } | null; error: string | null }> {
    return this.request<{ success: boolean }>("update-scores", {
      method: "POST",
      body: JSON.stringify({ conversation_id }),
    })
  }
}

// Export singleton instance
export const apiClient = new APIClient()
