import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/database.ts"
import { requireAuth } from "../_shared/auth.ts"
import type { GetScoresRequest, GetScoresResponse, Scenario, UserScore } from "../_shared/types.ts"

/**
 * GET /get-scores?scenario_slug=<slug> (optional)
 *
 * Fetches user scores:
 * - If scenario_slug provided: scores for that specific scenario
 * - If no scenario_slug: total scores across all scenarios (for header display)
 *
 * Returns:
 * - Best scores across all attempts
 * - Average scores
 * - Statistics (attempts, completed, last attempt)
 *
 * Requires authentication
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return errorResponse("Method not allowed", 405)
    }

    const supabase = getSupabaseClient(req)

    // Require authentication
    const authResult = await requireAuth(supabase)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    // Get scenario slug from query parameters
    const url = new URL(req.url)
    const scenario_slug = url.searchParams.get("scenario_slug")

    // If no scenario_slug provided, return total scores across all scenarios
    if (!scenario_slug) {
      const { data: allScores, error: allScoresError } = await supabase
        .from("user_scores")
        .select("*")
        .eq("user_id", userId)

      if (allScoresError || !allScores || allScores.length === 0) {
        const response: GetScoresResponse = {
          best_scores: {
            clarity: 0,
            friendly: 0,
            empathy: 0,
            total: 0,
            outcome_level: null,
          },
          average_scores: {
            clarity: 0,
            friendly: 0,
            empathy: 0,
            total: 0,
          },
          statistics: {
            attempts: 0,
            completed: 0,
            last_attempt: null,
          },
        }
        return jsonResponse(response)
      }

      // Sum up scores across all scenarios
      const totals = allScores.reduce(
        (acc, score) => ({
          best_clarity: acc.best_clarity + score.best_clarity_score,
          best_friendly: acc.best_friendly + score.best_friendly_score,
          best_empathy: acc.best_empathy + score.best_empathy_score,
          best_total: acc.best_total + score.best_total_score,
          avg_clarity: acc.avg_clarity + Number(score.avg_clarity_score),
          avg_friendly: acc.avg_friendly + Number(score.avg_friendly_score),
          avg_empathy: acc.avg_empathy + Number(score.avg_empathy_score),
          avg_total: acc.avg_total + Number(score.avg_total_score),
          attempts: acc.attempts + score.attempts_count,
          completed: acc.completed + score.completed_count,
        }),
        {
          best_clarity: 0,
          best_friendly: 0,
          best_empathy: 0,
          best_total: 0,
          avg_clarity: 0,
          avg_friendly: 0,
          avg_empathy: 0,
          avg_total: 0,
          attempts: 0,
          completed: 0,
        }
      )

      // Find the most recent last_attempt
      const lastAttempt = allScores.reduce((latest: string | null, score) => {
        if (!latest) return score.last_attempt_at
        if (!score.last_attempt_at) return latest
        return score.last_attempt_at > latest ? score.last_attempt_at : latest
      }, null)

      const response: GetScoresResponse = {
        best_scores: {
          clarity: totals.best_clarity,
          friendly: totals.best_friendly,
          empathy: totals.best_empathy,
          total: totals.best_total,
          outcome_level: null, // No outcome for aggregated scores
        },
        average_scores: {
          clarity: allScores.length > 0 ? totals.avg_clarity / allScores.length : 0,
          friendly: allScores.length > 0 ? totals.avg_friendly / allScores.length : 0,
          empathy: allScores.length > 0 ? totals.avg_empathy / allScores.length : 0,
          total: allScores.length > 0 ? totals.avg_total / allScores.length : 0,
        },
        statistics: {
          attempts: totals.attempts,
          completed: totals.completed,
          last_attempt: lastAttempt,
        },
      }

      return jsonResponse(response)
    }

    // Fetch specific scenario scores
    const { data: scenario, error: scenarioError } = await supabase
      .from("scenarios")
      .select("id")
      .eq("slug", scenario_slug)
      .eq("is_active", true)
      .single<Scenario>()

    if (scenarioError || !scenario) {
      return errorResponse("Scenario not found", 404)
    }

    // Fetch user scores for this scenario
    const { data: userScore, error: scoresError } = await supabase
      .from("user_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("scenario_id", scenario.id)
      .single<UserScore>()

    // If no scores exist yet, return defaults
    if (scoresError || !userScore) {
      const response: GetScoresResponse = {
        best_scores: {
          clarity: 0,
          friendly: 0,
          empathy: 0,
          total: 0,
          outcome_level: null,
        },
        average_scores: {
          clarity: 0,
          friendly: 0,
          empathy: 0,
          total: 0,
        },
        statistics: {
          attempts: 0,
          completed: 0,
          last_attempt: null,
        },
      }
      return jsonResponse(response)
    }

    const response: GetScoresResponse = {
      best_scores: {
        clarity: userScore.best_clarity_score,
        friendly: userScore.best_friendly_score,
        empathy: userScore.best_empathy_score,
        total: userScore.best_total_score,
        outcome_level: userScore.best_outcome_level,
      },
      average_scores: {
        clarity: Number(userScore.avg_clarity_score),
        friendly: Number(userScore.avg_friendly_score),
        empathy: Number(userScore.avg_empathy_score),
        total: Number(userScore.avg_total_score),
      },
      statistics: {
        attempts: userScore.attempts_count,
        completed: userScore.completed_count,
        last_attempt: userScore.last_attempt_at,
      },
    }

    return jsonResponse(response)
  } catch (error) {
    console.error("Unexpected error in get-scores:", error)
    return errorResponse("Internal server error", 500)
  }
})
