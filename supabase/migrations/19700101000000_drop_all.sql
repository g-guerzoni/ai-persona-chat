-- =============================================
-- DROP ALL TABLES - Run this to clean the database
-- =============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS user_scores CASCADE;
DROP TABLE IF EXISTS user_conversations CASCADE;
DROP TABLE IF EXISTS option_text_variants CASCADE;
DROP TABLE IF EXISTS conversation_options CASCADE;
DROP TABLE IF EXISTS conversation_nodes CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
