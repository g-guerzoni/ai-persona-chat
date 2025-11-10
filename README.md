# AI Persona Chat - Training Simulation

A domain-neutral training simulation where learners practice conversational skills with AI personas. Each simulation features unique personas with configurable OCEAN personality traits and randomly selected scenarios.

## Inital Idea
<img width="2188" height="889" alt="image" src="https://github.com/user-attachments/assets/0b0c68df-0880-48b1-9581-a1f01e71b150" />

## Deployed Application

Live URL: [To be added after deployment]

## Repository

GitHub: https://github.com/g-guerzoni/ai-persona-chat

## Overview

This application provides a realistic chat-based training environment where users can:

- Practice conversations with AI personas in various scenarios
- Experience different personality types based on OCEAN traits
- Receive real-time feedback on their communication skills
- Track their performance across multiple attempts
- Improve through repeated practice with assessment metrics

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn UI** - Component library

### Backend & Data

- **Supabase** - Backend as a Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (email/password)
  - Realtime subscriptions (for future features)
  - Edge Functions (Deno runtime)
- **Next.js API Routes** - Additional server logic
- **pg** (dev dependency) - PostgreSQL client for seeding scripts

### Real-time Communication

- **Supabase Realtime** - For future features (currently using Edge Functions with REST API)

## How to Run Locally

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier works)
- Supabase CLI (optional but recommended)

### Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/g-guerzoni/ai-persona-chat.git
cd ai-persona-chat
```

2. Install dependencies:

```bash
npm install
```

3. Create environment variables:

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

To get these values:

- Go to [Supabase Dashboard](https://app.supabase.com)
- Create a new project or select an existing one
- Navigate to Settings > API
- Copy the Project URL, anon/public key, and service_role key

**Note**: The service role key is required for the seeding script to bypass RLS when populating content tables.

4. Set up the database:

**Option A: Via Supabase CLI (Recommended)**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

This applies all migrations in order:

- `19700101000000_drop_all.sql` - Drops existing tables (clean slate)
- `20250110000000_schema_initial.sql` - Creates schema with RLS disabled on content tables

**Option B: Via Supabase Dashboard**

- Navigate to SQL Editor in your Supabase project
- First, run the drop script: `supabase/migrations/19700101000000_drop_all.sql`
- Then run: `supabase/migrations/20250110000000_schema_initial.sql`

5. Seed the database with conversation data:

```bash
export $(grep -v '^#' .env | xargs) && npm run seed:conversations
```

This populates the database with 4 complete scenario conversation trees:

- 128 conversation nodes (conversation, response, and end nodes)
- 120 user options
- 960 text variants (8 per option based on tone and trait levels)

**Note**: The seed script works because RLS is disabled on content tables. The content is read-only conversation data that all users can access.

6. Deploy Supabase Edge Functions:

```bash
npx supabase functions deploy
```

Or deploy individually:

```bash
npx supabase functions deploy select-option
npx supabase functions deploy get-scores
npx supabase functions deploy update-scores
```

**Note**: The `start-conversation` function exists but conversations are auto-created on first option selection for a simpler UX.

7. Start the development server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

9. Sign up for an account and start practicing conversations

## Architecture Overview

### System Flow

```
User Browser
    ↓
Next.js Frontend (React + TypeScript)
    ↓
Supabase Auth (Session Management)
    ↓
Edge Functions (Business Logic)
    ↓
PostgreSQL (Data Storage)
```

### Data Flow for a Conversation

1. **Initialization**
   - User selects a scenario tab (loaded from hardcoded metadata)
   - User configures settings: tone (friendly/professional) and trait levels (low/high)
   - Frontend displays initial AI message and starter options

2. **Conversation Start**
   - User selects their first option
   - `POST /select-option` Edge Function called with:
     - conversation_id: null (triggers auto-creation)
     - option_id (the selected option key or UUID)
     - scenario_slug, tone, primary_level, secondary_level
   - Creates `user_conversations` record automatically
   - Returns AI response and next options

3. **Conversation Progress**
   - User selects an option
   - `POST /select-option` Edge Function called with:
     - conversation_id
     - selected option_id
   - Returns:
     - AI response content
     - Score earned (clarity, friendly, empathy)
     - Next set of options (or completion flag)
   - Frontend updates UI with scores and messages

4. **Conversation Completion**
   - User reaches an endpoint node
   - Final scores calculated and displayed
   - `POST /update-scores` Edge Function called
   - Updates `user_scores` table with:
     - Best scores (max across all attempts)
     - Average scores
     - Completion statistics

5. **Score Tracking**
   - `GET /get-scores?scenario_slug=<slug>` retrieves scores for a specific scenario
   - `GET /get-scores` (no parameter) retrieves total scores across all scenarios
   - Scores are loaded on page mount and persist across refreshes
   - Displayed in the header with visual indicators

### Database Schema

**Core Tables:**

- `scenarios` - High-level scenario definitions (4 scenarios with trait mappings)
- `conversation_nodes` - Individual conversation states (~128 nodes total)
- `conversation_options` - User choice options (~120 options total)
- `option_text_variants` - Text variations based on tone/traits (~960 variants)
- `user_conversations` - Active and completed user sessions
- `conversation_history` - Full message logs
- `user_scores` - Aggregate performance statistics

**Row Level Security (RLS):**

- **Content tables** (scenarios, nodes, options, variants): RLS disabled - these contain public read-only conversation data
- **User tables** (user_conversations, conversation_history, user_scores): RLS enabled - users can only access their own data
- This approach allows easy seeding while maintaining user data privacy

### Key Design Decisions

1. **Hardcoded Metadata**: Persona information and OCEAN traits are stored in `src/data/metadata.ts` for instant loading, while conversation trees are database-driven for dynamic selection logic.

2. **Text Variants**: Each option has 8 variants (2 tones × 2 primary levels × 2 secondary levels) allowing personalized conversation experiences based on user settings.

3. **Rule-Based AI**: The "AI" responses are pre-scripted in conversation trees. No LLM is used, ensuring consistent training scenarios and predictable assessment.

4. **Edge Functions**: Server-side logic runs on Supabase Edge Functions (Deno) for low latency and seamless integration with the database.

5. **Settings Lock**: User settings (tone, trait levels) lock after the first message to ensure consistent scoring throughout a conversation.

6. **Simplified RLS**: Content tables have RLS disabled for easier seeding and public access, while user-specific tables maintain strict RLS policies for privacy.

7. **Option Key Flexibility**: The select-option edge function accepts both UUIDs and option keys (e.g., "opt_0_a") for easier testing and integration.

## Personas & Scenarios

The application includes 4 diverse scenarios with unique personas:

### 1. Billing Service (slug: `service`)

- **Persona**: Claudia - Frustrated Customer
- **Call ID**: 123456
- **Subject**: Refund Request
- **Notes**: Unexpected charge, loyal 2-year customer
- **Primary Trait**: Low Agreeableness (difficult, confrontational)
- **Secondary Trait**: High Neuroticism (emotional, stressed)
- **Challenge**: Handle frustration with empathy while maintaining professionalism

### 2. Technical Support (slug: `case`)

- **Persona**: Marcus - Technical User
- **Call ID**: 847293
- **Subject**: System Outage
- **Notes**: Critical production environment down, high technical knowledge
- **Primary Trait**: High Conscientiousness (detail-oriented, expects thoroughness)
- **Secondary Trait**: High Openness (receptive to solutions)
- **Challenge**: Provide technical clarity and demonstrate competence

### 3. Account Access (slug: `subject`)

- **Persona**: Sarah - Anxious User
- **Call ID**: 652418
- **Subject**: Account Lockout
- **Notes**: Urgent access needed, multiple reset attempts failed
- **Primary Trait**: Low Extraversion (reserved, cautious)
- **Secondary Trait**: High Neuroticism (worried, stressed)
- **Challenge**: Be reassuring and friendly while providing clear guidance

### 4. Product Complaint (slug: `notes`)

- **Persona**: David - Disappointed Client
- **Call ID**: 901234
- **Subject**: Product Defect - Third Complaint
- **Notes**: Recurring issue, considering competitors
- **Primary Trait**: Low Agreeableness (skeptical, direct)
- **Secondary Trait**: High Conscientiousness (tracks details, expects follow-through)
- **Challenge**: Balance all three skills - clarity, friendliness, and empathy

## Extensions Implemented

This project implements **two extensions** beyond the must-haves:

### 1. Live Feedback (Real-time Performance Indicators)

During conversation, users receive immediate visual feedback:

- **Score Badges**: Each user message displays a badge showing the highest score earned (e.g., "+2 Empathy")
- **Color-Coded Borders**: User messages are bordered with the color of their strongest score:
  - Yellow/Orange (oklch(0.65 0.22 60)) - Clarity
  - Green (oklch(0.7 0.2 140)) - Friendly
  - Blue (oklch(0.65 0.22 240)) - Empathy
- **Header Scores**: Live-updating gamification scores in the header show cumulative performance
  - Persists across page refreshes
  - Loads from database on mount
  - Ghost/skeleton loading state during fetch
- **Non-Intrusive**: Feedback is subtle and doesn't interrupt conversation flow
- **Context-Aware**: Scores reflect the specific choice made, helping users understand what worked
- **Loading States**: Smooth skeleton UI transitions prevent jarring blank spaces

**Why this extension?**
Live feedback accelerates learning by creating immediate associations between choices and outcomes. Users can adjust their approach mid-conversation rather than waiting for end-of-session assessment. Persistent scores across sessions motivate continued improvement.

### 2. Simulation Assessment (Comprehensive Scoring System)

After completing a conversation, users receive detailed feedback:

- **Three-Dimensional Scoring**:
  - **Clarity**: Clear communication, proper verification, structured responses
  - **Friendly**: Warm tone, positive language, relationship-building
  - **Empathy**: Understanding shown, acknowledgment of feelings, active listening
- **Scoring Mechanism**:
  - Each user choice awards 0-3 points per dimension
  - Total possible: ~30-40 points per category (varies by conversation length)
  - Overall total combines all three dimensions

- **Performance Tracking**:
  - Best scores across all attempts per scenario
  - Average scores showing improvement trends
  - Attempt count and completion statistics
  - Persistent scores displayed in header across page refreshes

- **Database-Driven**: All scoring is persisted in the `user_scores` table for historical analysis and potential leaderboard features.

**Why this extension?**
Assessment provides concrete goals and measurable improvement. The three-dimensional scoring reflects real-world conversational competencies: what you say (clarity), how you say it (friendly), and understanding why (empathy).

## Features

### Must-Haves (Implemented)

- **Simulated Conversation**: Full text-based chat interface with scripted AI responses
- **Start New Simulation**: "New Conversation" button resets state and allows configuration changes
- **Random Selection**: Each scenario has multiple response paths, creating varied experiences
- **Settings Configuration**:
  - Tone selection (friendly vs. professional)
  - Primary trait level (low vs. high)
  - Secondary trait level (low vs. high)
  - OCEAN trait visualization with sliders (display-only)

### Additional Features

- **Authentication**: Email/password sign-up and login via Supabase Auth
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessible UI**: ARIA labels, keyboard navigation, semantic HTML
- **Settings Panel**: Collapsible side panel (desktop) and bottom sheet (mobile)
- **Multi-Scenario Tabs**: Quick switching between different training scenarios
- **Conversation History**: Full message log persisted in database
- **Visual Polish**: Modern dark theme with smooth animations
- **Ghost Loading States**: Skeleton UI for smooth transitions during API calls
- **Persistent Scores**: Header scores load from database and survive page refreshes
- **Auto-Conversation Creation**: Simplified flow - conversations start automatically on first option select

## Known Limitations

1. **No LLM Integration**: Responses are pre-scripted, limiting conversation paths to predefined trees. Users cannot type free-form messages.

2. **Limited Conversation Depth**: Each scenario has 8-10 conversation turns. Longer, more complex scenarios would require additional content creation.

3. **Binary Trait Levels**: Settings use simple "low/high" rather than a continuous scale (0-100). This was chosen for simplicity but reduces granularity.

4. **No Voice/Video**: Text-only interface. Audio/video would significantly enhance realism for call center training.

5. **Single Language**: English only. Internationalization would require translating all 960 conversation variants.

6. **No Observability Dashboard**: While all data is collected, there's no admin interface to view metrics like active sessions, error rates, or usage patterns.

7. **Static Scoring**: Scoring rules are hardcoded in the seed data. Dynamic scoring based on user performance would enable adaptive difficulty.

8. **No Multiplayer**: Users train individually. Peer review or team-based exercises could add collaborative learning.

9. **Manual Schema Updates**: Database schema changes require manual drops/reapplies. Migration versioning is basic.

## What I'd Do With More Time

### Short Term (1-2 weeks)

1. **Observability Dashboard**
   - Admin panel showing active sessions, peak usage times
   - Error tracking and health indicators
   - User completion rates and average scores
   - Per-scenario analytics

2. **Enhanced Assessment**
   - Detailed post-conversation feedback with specific examples
   - Recommendations: "You missed verification in step 3"
   - Comparison to top performers
   - Achievement badges (e.g., "Empathy Master", "Perfect Score")

3. **Improved Mobile Experience**
   - Better touch targets for options
   - Optimized layout for small screens
   - Swipe gestures for settings panel

4. **More Content**
   - Additional scenarios (sales, healthcare, education)
   - Deeper conversation trees (15-20 turns)
   - More persona variations per scenario

### Medium Term (1-2 months)

5. **Free-Form Input with AI**
   - Integrate LLM (GPT-4, Claude) for natural language responses
   - Keep scoring system but allow typed messages
   - Hybrid approach: suggested options + free text

6. **Audio/Video Support**
   - WebRTC integration for voice practice
   - Speech-to-text for transcription
   - Tone analysis (speaking rate, pitch, pauses)
   - Optional video for visual cues practice

7. **Advanced Analytics**
   - Learning curves over time
   - Skill gap identification
   - Personalized training recommendations
   - Export reports for managers

8. **Gamification**
   - Experience points and leveling system
   - Daily challenges and streaks
   - Leaderboards (opt-in)
   - Unlockable scenarios

### Long Term (3-6 months)

9. **Team Features**
   - Manager accounts with team oversight
   - Assign specific scenarios to team members
   - Team performance dashboards
   - Peer review and feedback

10. **Content Creation Tools**
    - Admin interface to build new scenarios
    - Conversation tree editor with branching logic
    - Import/export scenario templates
    - Community-contributed content marketplace

11. **Adaptive Difficulty**
    - Dynamic persona adjustment based on user performance
    - Progressively harder challenges as skills improve
    - Personalized conversation paths

12. **Integration Capabilities**
    - LMS integration (SCORM compliance)
    - Single Sign-On (SSO) for enterprises
    - API for embedding in existing training platforms
    - Webhook support for external notifications

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run seed:conversations` - Populate database with scenarios
- `npm run supabase:link` - Link to Supabase project
- `npm run supabase:deploy` - Deploy Edge Functions
- `npm run supabase:setup` - Complete setup (seed + deploy)

## Troubleshooting

### Database Seeding Issues

If you encounter RLS (Row Level Security) errors during seeding:

**Error**: `new row violates row-level security policy for table "scenarios"`

**Solution**: The initial schema migration (`20250110000000_schema_initial.sql`) has RLS **disabled** on content tables to allow seeding. If you're still getting this error:

1. Verify the migration was applied: `supabase db push`
2. Check RLS status in Supabase Dashboard → SQL Editor:
   ```sql
   SELECT tablename, relrowsecurity
   FROM pg_tables t
   JOIN pg_class c ON c.relname = t.tablename
   WHERE schemaname = 'public'
   AND tablename IN ('scenarios', 'conversation_nodes', 'conversation_options', 'option_text_variants');
   ```
3. If RLS is enabled, disable it:
   ```sql
   ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
   ALTER TABLE conversation_nodes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE conversation_options DISABLE ROW LEVEL SECURITY;
   ALTER TABLE option_text_variants DISABLE ROW LEVEL SECURITY;
   ```

### Edge Function Deployment

If edge functions fail to deploy:

- Ensure you're logged in: `supabase login`
- Check project is linked: `supabase projects list`
- Deploy with verbose output: `supabase functions deploy --debug`

### Missing Scores After Refresh

If header scores show "0" after page refresh:

- Verify you're authenticated (logged in)
- Check browser console for API errors
- Ensure `get-scores` edge function is deployed
- Verify you've completed at least one conversation

## Deployment

### Vercel (Recommended for Frontend)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase (Backend)

Backend is already deployed via Supabase:

- Database hosted on Supabase cloud
- Edge Functions deployed to Supabase edge network
- Authentication managed by Supabase Auth

See `DEPLOYMENT.md` for detailed backend setup instructions.

## Environment Variables

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (for seeding only, not needed in production frontend)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Where to Use

- **Frontend** (Next.js): Needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Seeding Script**: Also needs `SUPABASE_SERVICE_ROLE_KEY` to populate content tables
- **Production Deployment**: Don't include service role key in frontend deployment

**Security**: Never commit `.env` to version control. Use your deployment platform's environment variable management (e.g., Vercel Environment Variables).

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (site)/                   # Main application
│   │   └── page.tsx              # Home/chat page
│   └── api/                      # API routes
├── components/
│   ├── features/                 # Feature components
│   │   ├── auth/                 # Auth forms
│   │   ├── chat/                 # Chat UI components
│   │   ├── conversation/         # Conversation options
│   │   ├── navigation/           # Header/nav
│   │   └── settings/             # Settings panels
│   └── ui/                       # Shadcn UI components
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication state
├── data/                         # Static data
│   ├── metadata.ts               # Persona/scenario metadata
│   └── scenarios.ts              # Scenario definitions
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth hook
│   ├── useConversation.ts        # Local conversation logic
│   └── useConversationAPI.ts     # API conversation logic
├── lib/                          # Utilities
│   ├── api/                      # API client
│   ├── auth/                     # Auth helpers
│   └── supabase/                 # Supabase clients
└── types/                        # TypeScript types

supabase/
├── fixtures/                     # Conversation tree JSON files
│   ├── service-conversation.json
│   ├── case-conversation.json
│   ├── subject-conversation.json
│   └── notes-conversation.json
├── functions/                    # Edge Functions (Deno)
│   ├── _shared/                  # Shared utilities
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   ├── database.ts
│   │   └── types.ts
│   ├── start-conversation/       # (Optional - auto-creation used instead)
│   ├── select-option/            # Main conversation handler
│   ├── get-scores/               # Score retrieval
│   └── update-scores/            # Score updates
├── migrations/                   # SQL migrations (2 files)
│   ├── 19700101000000_drop_all.sql
│   └── 20250110000000_schema_initial.sql
└── scripts/                      # Utility scripts
    └── seed-conversations.ts     # Database seeding
```

## Testing

Currently, the project does not include automated tests. With more time, I would add:

- **Unit tests**: Vitest for utility functions and hooks
- **Component tests**: React Testing Library for UI components
- **Integration tests**: Playwright for end-to-end user flows
- **Edge Function tests**: Deno's built-in test runner for backend logic

## License

This project is licensed under a Non-Commercial Study License. See the [LICENSE](LICENSE) file for details.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OCEAN Personality Traits](https://en.wikipedia.org/wiki/Big_Five_personality_traits)
- [Shadcn UI](https://ui.shadcn.com)

## Contact

For questions or issues, please open an issue on the GitHub repository.
