import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts"
import { getSupabaseClient } from "../_shared/database.ts"
import { requireAuth } from "../_shared/auth.ts"
import type {
  StartConversationRequest,
  StartConversationResponse,
  Scenario,
  ConversationNode,
  ConversationOption,
  OptionTextVariant,
} from "../_shared/types.ts"

/**
 * POST /start-conversation
 *
 * Starts a new conversation for a scenario
 * Creates a user_conversations record and returns initial options
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
    const body: StartConversationRequest = await req.json()
    const { scenario_slug, tone, primary_level, secondary_level } = body

    if (!scenario_slug || !tone || !primary_level || !secondary_level) {
      return errorResponse(
        "Missing required fields: scenario_slug, tone, primary_level, secondary_level",
        400
      )
    }

    // Validate tone and levels
    if (!["friendly", "professional"].includes(tone)) {
      return errorResponse("Invalid tone. Must be 'friendly' or 'professional'", 400)
    }
    if (!["low", "high"].includes(primary_level)) {
      return errorResponse("Invalid primary_level. Must be 'low' or 'high'", 400)
    }
    if (!["low", "high"].includes(secondary_level)) {
      return errorResponse("Invalid secondary_level. Must be 'low' or 'high'", 400)
    }

    // Fetch scenario with traits
    const { data: scenario, error: scenarioError } = await supabase
      .from("scenarios")
      .select("id, primary_trait, secondary_trait")
      .eq("slug", scenario_slug)
      .eq("is_active", true)
      .single<Scenario>()

    if (scenarioError || !scenario) {
      return errorResponse("Scenario not found", 404)
    }

    // Validate that traits are set
    if (!scenario.primary_trait || !scenario.secondary_trait) {
      return errorResponse("Scenario traits not configured", 500)
    }

    // Find the start node
    const { data: startNode, error: nodeError } = await supabase
      .from("conversation_nodes")
      .select("id, node_key")
      .eq("scenario_id", scenario.id)
      .eq("node_key", "start")
      .single<ConversationNode>()

    if (nodeError || !startNode) {
      return errorResponse("Start node not found", 404)
    }

    // Create user conversation
    const { data: conversation, error: conversationError } = await supabase
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
      .select("id")
      .single()

    if (conversationError || !conversation) {
      console.error("Error creating conversation:", conversationError)
      return errorResponse("Failed to create conversation", 500)
    }

    // Fetch initial options with text variants
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
          variant_key,
          tone,
          primary_level,
          secondary_level
        )
      `
      )
      .eq("node_id", startNode.id)
      .order("order_index", { ascending: true })
      .returns<
        Array<
          ConversationOption & {
            option_text_variants: OptionTextVariant[]
          }
        >
      >()

    if (optionsError) {
      console.error("Error fetching options:", optionsError)
      return errorResponse("Failed to fetch options", 500)
    }

    // Select the appropriate text variant for each option
    const variant_key = `${tone}-${primary_level}-${secondary_level}`

    const formattedOptions = (options || [])
      .map((option) => {
        const variant = option.option_text_variants?.find((v) => v.variant_key === variant_key)

        if (!variant) {
          console.warn(`Variant ${variant_key} not found for option ${option.option_key}`)
          return null
        }

        return {
          id: option.id,
          text: variant.text_content,
          order_index: option.order_index,
        }
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null)

    const response: StartConversationResponse = {
      conversation_id: conversation.id,
      initial_options: formattedOptions,
    }

    return jsonResponse(response)
  } catch (error) {
    console.error("Unexpected error in start-conversation:", error)
    return errorResponse("Internal server error", 500)
  }
})
