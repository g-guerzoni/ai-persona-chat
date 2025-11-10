import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import type {
  UserConversation,
  ConversationNode,
  ConversationOption,
  OptionTextVariant,
  SelectOptionResult,
} from "./types.ts"

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string | null,
  params: {
    scenario_slug?: string
    tone?: "friendly" | "professional"
    primary_level?: "low" | "high"
    secondary_level?: "low" | "high"
  }
): Promise<{
  conversation: UserConversation
  scenarioId: string
  currentNodeKey: string
}> {
  if (conversationId) {
    const { data: existingConversation, error: conversationError } = await supabase
      .from("user_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single<UserConversation>()

    if (conversationError || !existingConversation) {
      throw new Error("Conversation not found")
    }

    return {
      conversation: existingConversation,
      scenarioId: existingConversation.scenario_id,
      currentNodeKey: existingConversation.current_node_key,
    }
  }

  const { scenario_slug, tone, primary_level, secondary_level } = params

  if (!scenario_slug || !tone || !primary_level || !secondary_level) {
    throw new Error(
      "scenario_slug, tone, primary_level, and secondary_level are required for new conversations"
    )
  }

  if (!["friendly", "professional"].includes(tone)) {
    throw new Error("Invalid tone. Must be 'friendly' or 'professional'")
  }
  if (!["low", "high"].includes(primary_level)) {
    throw new Error("Invalid primary_level. Must be 'low' or 'high'")
  }
  if (!["low", "high"].includes(secondary_level)) {
    throw new Error("Invalid secondary_level. Must be 'low' or 'high'")
  }

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id")
    .eq("slug", scenario_slug)
    .eq("is_active", true)
    .single()

  if (scenarioError || !scenario) {
    throw new Error("Scenario not found")
  }

  const { data: newConversation, error: createError } = await supabase
    .from("user_conversations")
    .insert({
      user_id: userId,
      scenario_id: scenario.id,
      current_node_key: "start",
      is_completed: false,
      user_tone: tone,
      user_primary_level: primary_level,
      user_secondary_level: secondary_level,
    })
    .select("*")
    .single<UserConversation>()

  if (createError || !newConversation) {
    console.error("Error creating conversation:", createError)
    throw new Error("Failed to create conversation")
  }

  return {
    conversation: newConversation,
    scenarioId: scenario.id,
    currentNodeKey: "start",
  }
}

export async function validateAndFetchOption(
  supabase: SupabaseClient,
  optionId: string,
  nodeId: string,
  variantKey: string
): Promise<{
  option: ConversationOption & { option_text_variants: OptionTextVariant[] }
  selectedVariant: OptionTextVariant
}> {
  const optionQuery = supabase
    .from("conversation_options")
    .select(
      `
        id,
        option_key,
        score_clarity,
        score_friendly,
        score_empathy,
        next_node_key,
        option_text_variants (
          id,
          text_content,
          variant_key
        )
      `
    )
    .eq("node_id", nodeId)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(optionId)
  const { data: selectedOption, error: optionError } = await (
    isUUID ? optionQuery.eq("id", optionId) : optionQuery.eq("option_key", optionId)
  ).single<ConversationOption & { option_text_variants: OptionTextVariant[] }>()

  if (optionError || !selectedOption) {
    throw new Error("Invalid option for current node")
  }

  const selectedVariant = selectedOption.option_text_variants?.find(
    (v) => v.variant_key === variantKey
  )

  if (!selectedVariant) {
    throw new Error(`Text variant ${variantKey} not found`)
  }

  return { option: selectedOption, selectedVariant }
}

export async function recordConversationStep(
  supabase: SupabaseClient,
  conversationId: string,
  stepNumber: number,
  currentNode: ConversationNode,
  selectedOption: ConversationOption,
  selectedText: string,
  variantKey: string,
  scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
): Promise<void> {
  await supabase.from("conversation_history").insert({
    conversation_id: conversationId,
    step_number: stepNumber,
    node_key: currentNode.node_key,
    node_type: currentNode.node_type,
    selected_option_id: selectedOption.id,
    selected_option_key: selectedOption.option_key,
    selected_text_variant: variantKey,
    selected_text_content: selectedText,
    step_score_clarity: selectedOption.score_clarity,
    step_score_friendly: selectedOption.score_friendly,
    step_score_empathy: selectedOption.score_empathy,
    cumulative_score_clarity: scores.clarity,
    cumulative_score_friendly: scores.friendly,
    cumulative_score_empathy: scores.empathy,
    cumulative_total_score: scores.total,
  })
}

export async function recordAIResponse(
  supabase: SupabaseClient,
  conversationId: string,
  stepNumber: number,
  responseNode: ConversationNode,
  scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
): Promise<void> {
  await supabase.from("conversation_history").insert({
    conversation_id: conversationId,
    step_number: stepNumber,
    node_key: responseNode.node_key,
    node_type: responseNode.node_type,
    ai_response_content: responseNode.ai_response_content,
    cumulative_score_clarity: scores.clarity,
    cumulative_score_friendly: scores.friendly,
    cumulative_score_empathy: scores.empathy,
    cumulative_total_score: scores.total,
  })
}

export async function handleConversationCompletion(
  supabase: SupabaseClient,
  conversationId: string,
  responseNodeKey: string,
  scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
): Promise<"very_high" | "high" | "medium" | "low"> {
  let outcomeLevel: "very_high" | "high" | "medium" | "low"
  if (scores.total >= 18) outcomeLevel = "very_high"
  else if (scores.total >= 12) outcomeLevel = "high"
  else if (scores.total >= 6) outcomeLevel = "medium"
  else outcomeLevel = "low"

  await supabase
    .from("user_conversations")
    .update({
      current_node_key: responseNodeKey,
      is_completed: true,
      final_score_clarity: scores.clarity,
      final_score_friendly: scores.friendly,
      final_score_empathy: scores.empathy,
      final_total_score: scores.total,
      outcome_level: outcomeLevel,
      completed_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  return outcomeLevel
}

export async function fetchNextOptions(
  supabase: SupabaseClient,
  scenarioId: string,
  nextNodeKey: string,
  variantKey: string
): Promise<SelectOptionResult["next_options"]> {
  const { data: nextNode, error: nextNodeError } = await supabase
    .from("conversation_nodes")
    .select("id, node_key")
    .eq("scenario_id", scenarioId)
    .eq("node_key", nextNodeKey)
    .single<ConversationNode>()

  if (nextNodeError || !nextNode) {
    throw new Error("Next node not found")
  }

  const { data: options, error: optionsError } = await supabase
    .from("conversation_options")
    .select(
      `
          id,
          option_key,
          order_index,
          option_text_variants (
            id,
            text_content,
            variant_key
          )
        `
    )
    .eq("node_id", nextNode.id)
    .order("order_index", { ascending: true })
    .returns<
      Array<
        ConversationOption & {
          option_text_variants: OptionTextVariant[]
        }
      >
    >()

  if (optionsError) {
    throw new Error("Failed to fetch next options")
  }

  return (options || [])
    .map((option) => {
      const variant = option.option_text_variants?.find((v) => v.variant_key === variantKey)

      if (!variant) return null

      return {
        id: option.id,
        text: variant.text_content,
        order_index: option.order_index,
      }
    })
    .filter((opt): opt is NonNullable<typeof opt> => opt !== null)
}

export async function updateConversationProgress(
  supabase: SupabaseClient,
  conversationId: string,
  nextNodeKey: string,
  scores: {
    clarity: number
    friendly: number
    empathy: number
    total: number
  }
): Promise<void> {
  await supabase
    .from("user_conversations")
    .update({
      current_node_key: nextNodeKey,
      final_score_clarity: scores.clarity,
      final_score_friendly: scores.friendly,
      final_score_empathy: scores.empathy,
      final_total_score: scores.total,
    })
    .eq("id", conversationId)
}
