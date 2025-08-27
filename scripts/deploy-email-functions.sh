#!/bin/bash

# Email Notification System - Deployment Script
# This script deploys all email-related Supabase Edge Functions

echo "🚀 Deploying Email Notification System..."
echo "======================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "📧 Deploying send-booking-email function..."
supabase functions deploy send-booking-email

if [ $? -eq 0 ]; then
    echo "✅ send-booking-email deployed successfully"
else
    echo "❌ Failed to deploy send-booking-email"
    exit 1
fi

echo ""
echo "🔍 Deploying verify-email function..."
supabase functions deploy verify-email

if [ $? -eq 0 ]; then
    echo "✅ verify-email deployed successfully"
else
    echo "❌ Failed to deploy verify-email"
    exit 1
fi

echo ""
echo "⚡ Deploying process-escalations function..."
supabase functions deploy process-escalations

if [ $? -eq 0 ]; then
    echo "✅ process-escalations deployed successfully"
else
    echo "❌ Failed to deploy process-escalations"
    exit 1
fi

echo ""
echo "🎉 All email functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure environment variables in Supabase Dashboard:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_REGION (default: us-east-2)"
echo "2. Verify your domain in AWS SES"
echo "3. Request production access for AWS SES"
echo "4. Test the email flow"
echo ""
echo "📖 For detailed setup instructions, see EMAIL_NOTIFICATION_SETUP.md"
