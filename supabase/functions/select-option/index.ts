import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/database.ts"
import { requireAuth } from "../_shared/auth.ts"
import {
  getOrCreateConversation,
  validateAndFetchOption,
  recordConversationStep,
  recordAIResponse,
  handleConversationCompletion,
  fetchNextOptions,
  updateConversationProgress,
} from "../_shared/helpers.ts"
import type {
  SelectOptionRequest,
  SelectOptionResponse,
  ConversationNode,
} from "../_shared/types.ts"

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405)
    }

    const supabase = getSupabaseClient(req)

    const authResult = await requireAuth(supabase)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const body: SelectOptionRequest = await req.json()
    const { conversation_id, option_id, scenario_slug, tone, primary_level, secondary_level } = body

    if (!option_id) {
      return errorResponse("Missing required field: option_id", 400)
    }

    if (!conversation_id && (!scenario_slug || !tone || !primary_level || !secondary_level)) {
      return errorResponse(
        "Either conversation_id OR (scenario_slug, tone, primary_level, secondary_level) must be provided",
        400
      )
    }

    const { conversation, scenarioId, currentNodeKey } = await getOrCreateConversation(
      supabase,
      userId,
      conversation_id,
      { scenario_slug, tone, primary_level, secondary_level }
    )

    if (conversation.is_completed) {
      return errorResponse("Conversation is already completed", 400)
    }

    const { data: currentNode, error: nodeError } = await supabase
      .from("conversation_nodes")
      .select("id, node_key, node_type")
      .eq("scenario_id", scenarioId)
      .eq("node_key", currentNodeKey)
      .single<ConversationNode>()

    if (nodeError || !currentNode) {
      return errorResponse("Current node not found", 404)
    }

    const variant_key = `${conversation.user_tone}-${conversation.user_primary_level}-${conversation.user_secondary_level}`
    const { option: selectedOption, selectedVariant } = await validateAndFetchOption(
      supabase,
      option_id,
      currentNode.id,
      variant_key
    )

    const newClarityScore = conversation.final_score_clarity + selectedOption.score_clarity
    const newFriendlyScore = conversation.final_score_friendly + selectedOption.score_friendly
    const newEmpathyScore = conversation.final_score_empathy + selectedOption.score_empathy
    const newTotalScore = newClarityScore + newFriendlyScore + newEmpathyScore

    const { count: stepCount } = await supabase
      .from("conversation_history")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)

    const stepNumber = (stepCount || 0) + 1

    await recordConversationStep(
      supabase,
      conversation.id,
      stepNumber,
      currentNode,
      selectedOption,
      selectedVariant.text_content,
      variant_key,
      {
        clarity: newClarityScore,
        friendly: newFriendlyScore,
        empathy: newEmpathyScore,
        total: newTotalScore,
      }
    )

    const { data: responseNode, error: responseNodeError } = await supabase
      .from("conversation_nodes")
      .select("*")
      .eq("scenario_id", scenarioId)
      .eq("node_key", selectedOption.next_node_key)
      .single<ConversationNode>()

    if (responseNodeError || !responseNode) {
      return errorResponse("Response node not found", 404)
    }

    await recordAIResponse(supabase, conversation.id, stepNumber + 1, responseNode, {
      clarity: newClarityScore,
      friendly: newFriendlyScore,
      empathy: newEmpathyScore,
      total: newTotalScore,
    })

    const isComplete = responseNode.node_type === "end"
    let nextOptions: SelectOptionResponse["next_options"] = null
    let outcomeLevel: "very_high" | "high" | "medium" | "low" | undefined

    if (isComplete) {
      outcomeLevel = await handleConversationCompletion(
        supabase,
        conversation.id,
        responseNode.node_key,
        {
          clarity: newClarityScore,
          friendly: newFriendlyScore,
          empathy: newEmpathyScore,
          total: newTotalScore,
        }
      )
    } else {
      nextOptions = await fetchNextOptions(
        supabase,
        scenarioId,
        responseNode.next_node_key || "",
        variant_key
      )

      await updateConversationProgress(
        supabase,
        conversation.id,
        responseNode.next_node_key || "",
        {
          clarity: newClarityScore,
          friendly: newFriendlyScore,
          empathy: newEmpathyScore,
          total: newTotalScore,
        }
      )
    }

    const response: SelectOptionResponse = {
      conversation_id: conversation.id,
      ai_response: responseNode.ai_response_content || "",
      next_options: nextOptions,
      step_scores: {
        clarity: selectedOption.score_clarity,
        friendly: selectedOption.score_friendly,
        empathy: selectedOption.score_empathy,
      },
      cumulative_scores: {
        clarity: newClarityScore,
        friendly: newFriendlyScore,
        empathy: newEmpathyScore,
        total: newTotalScore,
      },
      is_completed: isComplete,
      outcome_level: outcomeLevel,
    }

    return jsonResponse(response)
  } catch (error) {
    console.error("Unexpected error in select-option:", error)
    if (error instanceof Error) {
      return errorResponse(error.message, 400)
    }
    return errorResponse("Internal server error", 500)
  }
})
