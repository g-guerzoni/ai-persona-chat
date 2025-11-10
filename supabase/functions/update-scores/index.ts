import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/database.ts"
import { requireAuth } from "../_shared/auth.ts"
import type { UserConversation, UserScore } from "../_shared/types.ts"

/**
 * POST /update-scores
 *
 * Updates user_scores aggregate statistics when a conversation completes
 * This is called automatically by a database trigger or manually by the client
 *
 * Request body: { conversation_id: string }
 *
 * Requires authentication
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405)
    }

    const supabase = getSupabaseClient(req)

    // Require authentication
    const authResult = await requireAuth(supabase)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    // Parse request body
    const body = await req.json()
    const { conversation_id } = body

    if (!conversation_id) {
      return errorResponse("Missing required field: conversation_id", 400)
    }

    // Fetch the completed conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("user_conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("user_id", userId)
      .single<UserConversation>()

    if (conversationError || !conversation) {
      return errorResponse("Conversation not found", 404)
    }

    if (!conversation.is_completed) {
      return errorResponse("Conversation is not completed yet", 400)
    }

    // Fetch or create user_scores record
    const { data: existingScore } = await supabase
      .from("user_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("scenario_id", conversation.scenario_id)
      .single<UserScore>()

    if (existingScore) {
      // Update existing record
      const newBestClarity = Math.max(
        existingScore.best_clarity_score,
        conversation.final_score_clarity
      )
      const newBestFriendly = Math.max(
        existingScore.best_friendly_score,
        conversation.final_score_friendly
      )
      const newBestEmpathy = Math.max(
        existingScore.best_empathy_score,
        conversation.final_score_empathy
      )
      const newBestTotal = Math.max(existingScore.best_total_score, conversation.final_total_score)

      // Calculate new averages
      const totalCompleted = existingScore.completed_count + 1
      const newAvgClarity =
        (existingScore.avg_clarity_score * existingScore.completed_count +
          conversation.final_score_clarity) /
        totalCompleted
      const newAvgFriendly =
        (existingScore.avg_friendly_score * existingScore.completed_count +
          conversation.final_score_friendly) /
        totalCompleted
      const newAvgEmpathy =
        (existingScore.avg_empathy_score * existingScore.completed_count +
          conversation.final_score_empathy) /
        totalCompleted
      const newAvgTotal =
        (existingScore.avg_total_score * existingScore.completed_count +
          conversation.final_total_score) /
        totalCompleted

      // Determine best outcome level
      let bestOutcomeLevel = existingScore.best_outcome_level
      if (
        conversation.outcome_level &&
        (!bestOutcomeLevel ||
          ["very_high", "high", "medium", "low"].indexOf(conversation.outcome_level) <
            ["very_high", "high", "medium", "low"].indexOf(bestOutcomeLevel))
      ) {
        bestOutcomeLevel = conversation.outcome_level
      }

      await supabase
        .from("user_scores")
        .update({
          best_clarity_score: newBestClarity,
          best_friendly_score: newBestFriendly,
          best_empathy_score: newBestEmpathy,
          best_total_score: newBestTotal,
          best_outcome_level: bestOutcomeLevel,
          avg_clarity_score: newAvgClarity,
          avg_friendly_score: newAvgFriendly,
          avg_empathy_score: newAvgEmpathy,
          avg_total_score: newAvgTotal,
          attempts_count: existingScore.attempts_count + 1,
          completed_count: totalCompleted,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existingScore.id)
    } else {
      // Create new record
      await supabase.from("user_scores").insert({
        user_id: userId,
        scenario_id: conversation.scenario_id,
        best_clarity_score: conversation.final_score_clarity,
        best_friendly_score: conversation.final_score_friendly,
        best_empathy_score: conversation.final_score_empathy,
        best_total_score: conversation.final_total_score,
        best_outcome_level: conversation.outcome_level,
        avg_clarity_score: conversation.final_score_clarity,
        avg_friendly_score: conversation.final_score_friendly,
        avg_empathy_score: conversation.final_score_empathy,
        avg_total_score: conversation.final_total_score,
        attempts_count: 1,
        completed_count: 1,
        last_attempt_at: new Date().toISOString(),
      })
    }

    return jsonResponse({ success: true })
  } catch (error) {
    console.error("Unexpected error in update-scores:", error)
    return errorResponse("Internal server error", 500)
  }
})
