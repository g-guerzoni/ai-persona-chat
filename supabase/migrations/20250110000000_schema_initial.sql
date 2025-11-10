-- =============================================
-- AI Persona Chat - Initial Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SCENARIOS TABLE
-- Stores the different conversation scenarios (tabs)
-- =============================================
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'service', 'case', 'notes', 'subject'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name for UI
  primary_trait TEXT NOT NULL, -- 'clarity', 'empathy', 'friendly'
  secondary_trait TEXT NOT NULL, -- 'clarity', 'empathy', 'friendly'
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_slug ON scenarios(slug);
CREATE INDEX idx_scenarios_active ON scenarios(is_active);
CREATE INDEX idx_scenarios_order ON scenarios(order_index);

-- Note: Scenario metadata (persona info, traits, initial messages) is now
-- hardcoded in the frontend (src/data/metadata.ts) for instant loading.
-- Only the scenarios table is kept for backend reference linking.

-- =============================================
-- CONVERSATION NODES TABLE
-- Stores the conversation tree structure
-- =============================================
CREATE TABLE conversation_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL, -- 'start', 'level_1_a', 'response_0_a', etc.
  node_type TEXT NOT NULL CHECK (node_type IN ('conversation', 'response', 'end')),
  level INTEGER CHECK (level >= 0 AND level <= 3),

  -- For response nodes
  ai_response_content TEXT,

  -- Navigation
  next_node_key TEXT, -- For response nodes pointing to next conversation node

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scenario_id, node_key)
);

CREATE INDEX idx_conversation_nodes_scenario ON conversation_nodes(scenario_id);
CREATE INDEX idx_conversation_nodes_key ON conversation_nodes(scenario_id, node_key);
CREATE INDEX idx_conversation_nodes_type ON conversation_nodes(node_type);
CREATE INDEX idx_conversation_nodes_level ON conversation_nodes(level);

-- =============================================
-- CONVERSATION OPTIONS TABLE
-- Stores user choice options with scores
-- =============================================
CREATE TABLE conversation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES conversation_nodes(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL, -- 'opt_0_a', 'opt_1_a1', etc.
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Scores
  score_clarity INTEGER NOT NULL CHECK (score_clarity >= -1 AND score_clarity <= 2),
  score_friendly INTEGER NOT NULL CHECK (score_friendly >= -1 AND score_friendly <= 2),
  score_empathy INTEGER NOT NULL CHECK (score_empathy >= -1 AND score_empathy <= 2),

  -- Navigation
  next_node_key TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(node_id, option_key)
);

CREATE INDEX idx_conversation_options_node ON conversation_options(node_id);
CREATE INDEX idx_conversation_options_key ON conversation_options(option_key);
CREATE INDEX idx_conversation_options_next_node ON conversation_options(next_node_key);

-- =============================================
-- OPTION TEXT VARIANTS TABLE
-- Stores 8 text variants per option (tone × primary × secondary)
-- =============================================
CREATE TABLE option_text_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES conversation_options(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL, -- 'friendly-low-low', 'professional-high-low', etc.
  text_content TEXT NOT NULL,

  -- Parsed variant components for easier querying
  tone TEXT NOT NULL CHECK (tone IN ('friendly', 'professional')),
  primary_level TEXT NOT NULL CHECK (primary_level IN ('low', 'high')),
  secondary_level TEXT NOT NULL CHECK (secondary_level IN ('low', 'high')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(option_id, variant_key)
);

CREATE INDEX idx_option_text_variants_option ON option_text_variants(option_id);
CREATE INDEX idx_option_text_variants_key ON option_text_variants(option_id, variant_key);
CREATE INDEX idx_option_text_variants_components ON option_text_variants(tone, primary_level, secondary_level);

-- =============================================
-- USER CONVERSATIONS TABLE
-- Tracks active conversation state for each user
-- =============================================
CREATE TABLE user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

  -- Current state
  current_node_key TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,

  -- User settings for this conversation
  user_tone TEXT NOT NULL CHECK (user_tone IN ('friendly', 'professional')),
  user_primary_level TEXT NOT NULL CHECK (user_primary_level IN ('low', 'high')),
  user_secondary_level TEXT NOT NULL CHECK (user_secondary_level IN ('low', 'high')),

  -- Final scores
  final_score_clarity INTEGER DEFAULT 0,
  final_score_friendly INTEGER DEFAULT 0,
  final_score_empathy INTEGER DEFAULT 0,
  final_total_score INTEGER DEFAULT 0,

  -- Outcome
  outcome_level TEXT CHECK (outcome_level IN ('very_high', 'high', 'medium', 'low')),

  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_conversations_user ON user_conversations(user_id);
CREATE INDEX idx_user_conversations_scenario ON user_conversations(scenario_id);
CREATE INDEX idx_user_conversations_completed ON user_conversations(is_completed);
CREATE INDEX idx_user_conversations_user_scenario ON user_conversations(user_id, scenario_id);
CREATE INDEX idx_user_conversations_user_active ON user_conversations(user_id, is_completed) WHERE is_completed = false;

-- =============================================
-- CONVERSATION HISTORY TABLE
-- Step-by-step log of each conversation
-- =============================================
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES user_conversations(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,

  -- Node information
  node_key TEXT NOT NULL,
  node_type TEXT NOT NULL,

  -- For user selections
  selected_option_id UUID REFERENCES conversation_options(id),
  selected_option_key TEXT,
  selected_text_variant TEXT,
  selected_text_content TEXT,

  -- For AI responses
  ai_response_content TEXT,

  -- Scores at this step
  step_score_clarity INTEGER DEFAULT 0,
  step_score_friendly INTEGER DEFAULT 0,
  step_score_empathy INTEGER DEFAULT 0,

  -- Cumulative scores
  cumulative_score_clarity INTEGER DEFAULT 0,
  cumulative_score_friendly INTEGER DEFAULT 0,
  cumulative_score_empathy INTEGER DEFAULT 0,
  cumulative_total_score INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_history_conversation ON conversation_history(conversation_id);
CREATE INDEX idx_conversation_history_step ON conversation_history(conversation_id, step_number);
CREATE INDEX idx_conversation_history_created ON conversation_history(created_at);

-- =============================================
-- USER SCORES TABLE
-- Aggregate statistics per user per scenario
-- =============================================
CREATE TABLE user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

  -- Best scores
  best_clarity_score INTEGER DEFAULT 0,
  best_friendly_score INTEGER DEFAULT 0,
  best_empathy_score INTEGER DEFAULT 0,
  best_total_score INTEGER DEFAULT 0,
  best_outcome_level TEXT,

  -- Averages
  avg_clarity_score DECIMAL(5,2) DEFAULT 0,
  avg_friendly_score DECIMAL(5,2) DEFAULT 0,
  avg_empathy_score DECIMAL(5,2) DEFAULT 0,
  avg_total_score DECIMAL(5,2) DEFAULT 0,

  -- Statistics
  attempts_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, scenario_id)
);

CREATE INDEX idx_user_scores_user ON user_scores(user_id);
CREATE INDEX idx_user_scores_scenario ON user_scores(scenario_id);
CREATE INDEX idx_user_scores_best_total ON user_scores(best_total_score DESC);
CREATE INDEX idx_user_scores_user_scenario ON user_scores(user_id, scenario_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_nodes_updated_at BEFORE UPDATE ON conversation_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_options_updated_at BEFORE UPDATE ON conversation_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_conversations_updated_at BEFORE UPDATE ON user_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_scores_updated_at BEFORE UPDATE ON user_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on user-specific tables (always protected)
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- RLS DISABLED on content tables to allow seeding
-- These tables contain read-only conversation data
-- RLS can be enabled later if needed for additional security
-- ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversation_nodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversation_options ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE option_text_variants ENABLE ROW LEVEL SECURITY;

-- Note: No RLS policies needed for content tables since RLS is disabled
-- Content tables (scenarios, conversation_nodes, conversation_options, option_text_variants)
-- are accessible to all users for reading conversation data

-- User-specific conversation data (users only see their own data)
CREATE POLICY "Users can view their own conversations"
  ON user_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON user_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON user_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversation history"
  ON conversation_history FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM user_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own conversation history"
  ON conversation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM user_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own scores"
  ON user_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
  ON user_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
  ON user_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE scenarios IS 'Conversation scenarios (tabs) available in the application';
COMMENT ON TABLE conversation_nodes IS 'Tree structure of conversation nodes';
COMMENT ON TABLE conversation_options IS 'User choice options with scoring';
COMMENT ON TABLE option_text_variants IS '8 text variants per option based on tone and OCEAN traits';
COMMENT ON TABLE user_conversations IS 'Active conversation sessions for users';
COMMENT ON TABLE conversation_history IS 'Step-by-step conversation log';
COMMENT ON TABLE user_scores IS 'Aggregate user statistics per scenario';
