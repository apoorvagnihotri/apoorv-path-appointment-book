# Email Notification System Setup Guide

This guide explains how to set up the email notification system for the Apoorv Pathology booking application.

## 🏗️ Architecture & Services Used

### Services Overview
1. **Supabase Edge Functions** - Server-side functions for email processing
2. **Resend** - Professional email delivery service
3. **Supabase Database** - Email tracking and escalation management
4. **Supabase Cron** - Automated escalation scheduling

### Why These Services?

#### Supabase Edge Functions
- **Purpose**: Server-side email processing and verification
- **Benefits**: 
  - Secure (runs on server, not client)
  - Fast (deployed globally)
  - Integrated with your Supabase project
  - TypeScript support
- **Alternative**: Could use AWS Lambda, Vercel Functions, or other serverless platforms

#### Resend Email Service
- **Purpose**: Reliable email delivery
- **Benefits**:
  - High deliverability rates
  - Professional email templates
  - Good developer experience
  - Reasonable pricing
- **Alternatives**: SendGrid, Mailgun, AWS SES, or Nodemailer with SMTP

#### Database Tables
- `email_notifications`: Track all sent emails and their status
- `email_escalations`: Manage escalation timing and tracking

## 📧 System Overview

When a booking is confirmed:
1. **Immediate Email** → apoorvpath@gmail.com with booking details and verification link
2. **Verification Tracking** → System tracks if the email is opened/verified
3. **Auto-Escalation** → If not verified within 2 hours → deepaagni@gmail.com gets escalation email

## 🛠️ Setup Steps

### 1. Database Migration

Apply the email notification migration:

```bash
# Run the migration to create email notification tables
npx supabase db push
```

This creates:
- `email_notifications` table
- `email_escalations` table
- Helper functions for verification and escalation

### 2. Email Service Setup (Resend)

1. Sign up for [Resend](https://resend.com) account
2. Get your API key from the dashboard
3. Add domain verification (optional, can use resend domain initially)

### 3. Environment Variables

Add these environment variables to your Supabase Edge Functions:

```bash
# In Supabase Dashboard > Settings > Edge Functions > Environment Variables
RESEND_API_KEY=your_resend_api_key_here
```

### 4. Deploy Edge Functions

Deploy the three edge functions:

```bash
# Deploy email sending function
npx supabase functions deploy send-booking-email

# Deploy email verification function  
npx supabase functions deploy verify-email

# Deploy escalation processing function
npx supabase functions deploy process-escalations
```

### 5. Set Up Automated Escalation (Optional)

#### Option A: Supabase Cron (Recommended)
Create a cron job in your Supabase project:

```sql
-- Run every 30 minutes to check for escalations
SELECT cron.schedule('process-email-escalations', '*/30 * * * *', 'SELECT net.http_post(url := ''https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/process-escalations'', headers := ''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'') as request_id;');
```

#### Option B: External Cron Service
Use services like:
- GitHub Actions (scheduled workflows)
- Vercel Cron
- External cron services

Point them to: `https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/process-escalations`

## 🔧 Configuration Options

### Escalation Timeout
Default: 2 hours. Change in the email service:
```typescript
// In emailNotificationService.ts
verification_timeout_hours: 2  // Change this value
```

### Email Recipients
- **Primary**: apoorvpath@gmail.com (configurable in Payment.tsx)
- **Escalation**: deepaagni@gmail.com (configurable in emailNotificationService.ts)

### Email Templates
Templates are in the edge functions and can be customized:
- `send-booking-email/index.ts` - HTML template function
- Includes booking details, customer info, and verification button

## 📊 Monitoring & Debugging

### View Email Status
Query the database to check email statuses:

```sql
-- Check recent email notifications
SELECT 
  en.*,
  o.order_number,
  o.customer_details->>'name' as customer_name
FROM email_notifications en
JOIN orders o ON en.order_id = o.id
ORDER BY en.created_at DESC
LIMIT 20;

-- Check escalations
SELECT 
  ee.*,
  en.recipient_email,
  en.status,
  en.sent_at,
  en.verified_at
FROM email_escalations ee
JOIN email_notifications en ON ee.original_notification_id = en.id
ORDER BY ee.created_at DESC;
```

### Test Email Verification
Access verification URLs directly:
```
https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/verify-email?token=YOUR_VERIFICATION_TOKEN
```

### Manual Escalation Processing
Trigger escalation processing manually:
```bash
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/process-escalations \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## 🎨 Customization

### Email Templates
Edit the HTML templates in:
- `supabase/functions/send-booking-email/index.ts`
- `supabase/functions/verify-email/index.ts`

### Notification Rules
Modify escalation logic in:
- `src/lib/emailNotificationService.ts`
- `supabase/functions/process-escalations/index.ts`

### Recipients
Change email addresses in:
- Payment.tsx (primary notification)
- emailNotificationService.ts (escalation email)

## 🚨 Troubleshooting

### Email Not Sending (500 Error)
**Most Common Issues:**

1. **Missing RESEND_API_KEY** (Most Likely Cause)
   - Go to Supabase Dashboard → Settings → Edge Functions → Environment Variables
   - Add: `RESEND_API_KEY=re_your_api_key_here`
   - Redeploy functions: `npm run email:deploy`

2. **Database Tables Missing**
   - Check if migration was applied: `npx supabase db push --linked`
   - If tables don't exist, run the migration SQL manually in Supabase SQL Editor

3. **Function Logs Check**
   - Go to Supabase Dashboard → Edge Functions → send-booking-email → Logs
   - Look for specific error messages

### Quick Debug Steps:
```bash
# 1. Test function directly (replace YOUR_SERVICE_ROLE_KEY)
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 2. Check if tables exist in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'email_%';
```

### Verification Not Working
1. Ensure verification token is valid
2. Check if email was already verified
3. Verify database connection in edge function

### Escalations Not Processing
1. Check cron job is running
2. Verify escalation processing function
3. Check database query for emails needing escalation

## 🔒 Security Notes

- Verification tokens are UUIDs, secure and unique
- Edge functions use service role key (keep secure)
- Email content doesn't include sensitive payment info
- RLS policies protect database access

## 📝 Testing

### Test Email Flow
1. Place a test booking
2. Check email is received at apoorvpath@gmail.com
3. Click verification link
4. Wait 2+ hours (or modify timeout for testing)
5. Check escalation email at deepaagni@gmail.com

### Test Components Individually
```bash
# Test email sending
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"notificationId": "test", "verificationToken": "test-token", "emailData": {...}}'

# Test escalation processing
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/process-escalations \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## 🎯 Next Steps

1. **Apply database migration**
2. **Set up Resend account and get API key**
3. **Configure environment variables**
4. **Deploy edge functions**
5. **Set up cron job for escalations**
6. **Test the complete flow**
7. **Monitor email delivery and verification rates**

The system is now ready to automatically notify the pathology team about new bookings and escalate if needed!
