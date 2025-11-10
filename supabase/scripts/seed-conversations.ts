#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing environment variables!")
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
// The service role key as the second parameter should automatically bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface ScenarioConfig {
  slug: string
  title: string
  icon: string
  primaryTrait: string
  secondaryTrait: string
  orderIndex: number
}

const SCENARIOS: ScenarioConfig[] = [
  {
    slug: "service",
    title: "Billing Service",
    icon: "CreditCard",
    primaryTrait: "agreeableness",
    secondaryTrait: "neuroticism",
    orderIndex: 0,
  },
  {
    slug: "case",
    title: "Technical Support",
    icon: "Wrench",
    primaryTrait: "conscientiousness",
    secondaryTrait: "openness",
    orderIndex: 1,
  },
  {
    slug: "subject",
    title: "Account Access",
    icon: "Lock",
    primaryTrait: "extraversion",
    secondaryTrait: "neuroticism",
    orderIndex: 2,
  },
  {
    slug: "notes",
    title: "Product Complaint",
    icon: "AlertCircle",
    primaryTrait: "agreeableness",
    secondaryTrait: "conscientiousness",
    orderIndex: 3,
  },
]

async function loadJSONFile(fileName: string): Promise<unknown> {
  const filePath = path.join(process.cwd(), "supabase/fixtures", fileName)
  const fileContent = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(fileContent)
}

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...\n")

  // Delete in reverse order of dependencies
  await supabase
    .from("conversation_history")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase.from("user_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase
    .from("user_conversations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase
    .from("option_text_variants")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase
    .from("conversation_options")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase
    .from("conversation_nodes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
  await supabase.from("scenarios").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  console.log("✓ Database cleared\n")
}

async function seedScenario(config: ScenarioConfig) {
  console.log(`📦 Seeding scenario: ${config.slug} (${config.title})...`)

  try {
    // Load conversation tree from JSON file (still needed for the conversation data)
    const conversationJSON = await loadJSONFile(`${config.slug}-conversation.json`)

    // Create scenario (metadata is now hardcoded in frontend)
    const { data: scenario, error: scenarioError } = await supabase
      .from("scenarios")
      .insert({
        slug: config.slug,
        title: config.title,
        icon: config.icon,
        primary_trait: config.primaryTrait,
        secondary_trait: config.secondaryTrait,
        order_index: config.orderIndex,
        is_active: true,
      })
      .select()
      .single()

    if (scenarioError) {
      console.error("Full scenario error:", JSON.stringify(scenarioError, null, 2))
      throw new Error(
        `Failed to create scenario: ${scenarioError.message || JSON.stringify(scenarioError)}`
      )
    }
    console.log(`  ✓ Created scenario (ID: ${scenario.id.substring(0, 8)}...)`)

    // 2. Create conversation nodes and options
    const nodeIdMap = new Map<string, string>() // node_key -> uuid
    let totalNodes = 0
    let totalOptions = 0
    let totalVariants = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const treeNode of (conversationJSON as any).conversationTree) {
      // Determine node type
      // Check for end nodes FIRST (they also have type: "ai_response")
      let nodeType: string
      if (treeNode.id.startsWith("end_")) {
        nodeType = "end"
      } else if (treeNode.type === "ai_response") {
        nodeType = "response"
      } else {
        nodeType = "conversation"
      }

      // Create node
      const { data: node, error: nodeError } = await supabase
        .from("conversation_nodes")
        .insert({
          scenario_id: scenario.id,
          node_key: treeNode.id,
          node_type: nodeType,
          level: treeNode.level !== undefined ? treeNode.level : null,
          ai_response_content: treeNode.content || null,
          next_node_key: treeNode.nextNodeId || null,
        })
        .select()
        .single()

      if (nodeError) throw new Error(`Failed to create node ${treeNode.id}: ${nodeError.message}`)

      nodeIdMap.set(treeNode.id, node.id)
      totalNodes++

      // Create options for conversation nodes
      if (treeNode.options && Array.isArray(treeNode.options)) {
        for (let i = 0; i < treeNode.options.length; i++) {
          const option = treeNode.options[i]

          // Create option
          const { data: dbOption, error: optionError } = await supabase
            .from("conversation_options")
            .insert({
              node_id: node.id,
              option_key: option.id,
              order_index: i,
              score_clarity: option.scores.clarity,
              score_friendly: option.scores.friendly,
              score_empathy: option.scores.empathy,
              next_node_key: option.nextNodeId,
            })
            .select()
            .single()

          if (optionError)
            throw new Error(`Failed to create option ${option.id}: ${optionError.message}`)
          totalOptions++

          // Create text variants (8 per option)
          const variants = []
          for (const [variantKey, textContent] of Object.entries(option.text)) {
            const [tone, primaryLevel, secondaryLevel] = (variantKey as string).split("-")

            variants.push({
              option_id: dbOption.id,
              variant_key: variantKey,
              text_content: textContent,
              tone,
              primary_level: primaryLevel,
              secondary_level: secondaryLevel,
            })
          }

          const { error: variantsError } = await supabase
            .from("option_text_variants")
            .insert(variants)

          if (variantsError)
            throw new Error(`Failed to create variants for ${option.id}: ${variantsError.message}`)
          totalVariants += variants.length
        }
      }
    }

    console.log(
      `  ✓ Created ${totalNodes} nodes, ${totalOptions} options, ${totalVariants} text variants`
    )
    console.log(`✅ Completed ${config.slug}\n`)
  } catch (error) {
    console.error(`❌ Error seeding ${config.slug}:`, error)
    throw error
  }
}

async function main() {
  console.log("🌱 Starting database seed...\n")
  console.log("Supabase URL:", supabaseUrl ? "✓ Configured" : "✗ Missing")
  console.log("Service Role Key:", supabaseServiceRoleKey ? "✓ Present" : "✗ Missing")
  console.log("")

  try {
    // Clear existing data
    await clearDatabase()

    // Seed all scenarios
    for (const scenario of SCENARIOS) {
      await seedScenario(scenario)
    }

    console.log("✅ Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`   • ${SCENARIOS.length} scenarios seeded`)
    console.log(`   • Ready for use in the application`)
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error)
    process.exit(1)
  }
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
