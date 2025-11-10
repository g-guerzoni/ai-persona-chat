#!/bin/bash

# Deploy all Supabase Edge Functions
# Usage: ./supabase/scripts/deploy-functions.sh

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    echo "Or: brew install supabase/tap/supabase"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Array of function names
FUNCTIONS=(
    "start-conversation"
    "select-option"
    "get-scores"
    "update-scores"
)

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    echo "📦 Deploying $func..."
    npx supabase functions deploy "$func"

    if [ $? -eq 0 ]; then
        echo "✅ $func deployed successfully"
    else
        echo "❌ Failed to deploy $func"
        exit 1
    fi
    echo ""
done

echo ""
echo "🎉 All Edge Functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify at: https://app.supabase.com/project/[YOUR_PROJECT_REF]/functions"
echo "2. Test the application at: http://localhost:3000"
