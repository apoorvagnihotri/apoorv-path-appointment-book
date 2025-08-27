# Email Notification System Setup Guide

This guide explains how to set up the email notification system for the Apoorv Pathology booking application.

## 🏗️ Architecture & Services Used

### Services Overview
1. **Supabase Edge Functions** - Server-side functions for email processing
2. **AWS SES (Simple Email Service)** - Professional email delivery service
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

#### AWS SES Email Service
- **Purpose**: Reliable email delivery
- **Benefits**:
  - High deliverability rates (99%+)
  - Cost-effective ($0.10 per 1000 emails)
  - Integrated with AWS ecosystem
  - Advanced bounce and complaint handling
  - Professional email templates
  - Excellent reputation management
- **Alternatives**: SendGrid, Mailgun, Resend, or Nodemailer with SMTP

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

### 2. Email Service Setup (AWS SES)

#### Step 2.1: AWS Account Setup
1. **Login to AWS Console**
2. **Navigate to SES** (Simple Email Service)
3. **Select your preferred region** (e.g., us-east-2 for Ohio)

#### Step 2.2: Domain Verification
1. **Add and verify your domain**: `bookings.apoorvpathology.com`
   ```bash
   # In AWS SES Console > Verified identities > Create identity
   # Choose "Domain" and enter: bookings.apoorvpathology.com
   ```

2. **Add DNS records** provided by AWS to your domain:
   - CNAME record for domain verification
   - TXT records for DKIM authentication
   - SPF record: `"v=spf1 include:amazonses.com ~all"`
   - DMARC record: `"v=DMARC1; p=quarantine; rua=mailto:postmaster@apoorvpathology.com"`

#### Step 2.3: Production Access
1. **Request Production Access**:
   - Go to AWS SES Console → Account Dashboard
   - Click "Request production access"
   - Fill out the use case form (mention medical booking notifications)
   - Typical approval time: 1-2 business days

#### Step 2.4: IAM User Setup
1. **Create IAM User** with SES permissions:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "ses:SendEmail",
                   "ses:SendRawEmail",
                   "ses:GetSendQuota",
                   "ses:GetSendStatistics"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

2. **Generate Access Keys**:
   - Save Access Key ID and Secret Access Key securely
   - You'll need these for environment variables

### 3. Environment Variables

Add these environment variables to your Supabase Edge Functions:

```bash
# In Supabase Dashboard > Settings > Edge Functions > Environment Variables
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-2
# Optional: Keep Resend as fallback
RESEND_API_KEY=your_resend_api_key_here
```

### 4. Deploy Edge Functions

Deploy the three edge functions:

```bash
# Deploy email sending function (with AWS SES integration)
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

1. **Missing AWS Credentials** (Most Likely Cause)
   - Go to Supabase Dashboard → Settings → Edge Functions → Environment Variables
   - Add: `AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX`
   - Add: `AWS_SECRET_ACCESS_KEY=your_secret_access_key_here`
   - Add: `AWS_REGION=us-east-2` (or your preferred region)
   - Redeploy functions: `npm run email:deploy`

2. **AWS SES Sandbox Mode**
   - New AWS SES accounts start in sandbox mode
   - Can only send to verified email addresses
   - Request production access via AWS Console → SES → Account Dashboard

3. **Domain Not Verified**
   - Verify your sending domain in AWS SES Console
   - Add required DNS records (DKIM, SPF, DMARC)
   - Wait for verification to complete

4. **Database Tables Missing**
   - Check if migration was applied: `npx supabase db push --linked`
   - If tables don't exist, run the migration SQL manually in Supabase SQL Editor

5. **Function Logs Check**
   - Go to Supabase Dashboard → Edge Functions → send-booking-email → Logs
   - Look for specific error messages

### Quick Debug Steps:
```bash
# 1. Test function directly (replace YOUR_SERVICE_ROLE_KEY)
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 2. Check AWS SES service status
aws ses get-send-quota --region us-east-2

# 3. Verify domain status
aws ses get-identity-verification-attributes --identities bookings.apoorvpathology.com --region us-east-2

# 4. Check if tables exist in Supabase SQL Editor:
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
# Test email sending with AWS SES
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "test", 
    "verificationToken": "test-token", 
    "emailData": {
      "orderId": "test-order",
      "recipientEmail": "test@example.com",
      "emailType": "booking_notification",
      "orderDetails": {
        "orderNumber": "TEST-001",
        "customerName": "Test Customer",
        "customerEmail": "customer@example.com",
        "totalAmount": 500,
        "collectionType": "home",
        "items": [{"name": "Blood Test", "price": 500}]
      }
    }
  }'

# Test escalation processing
curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/process-escalations \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Check AWS SES sending statistics
aws ses get-send-statistics --region us-east-2
```

## 🎯 Next Steps

1. **Apply database migration**
2. **Set up AWS SES account and verify domain**
3. **Configure AWS credentials in environment variables**
4. **Deploy edge functions**
5. **Set up cron job for escalations**
6. **Test the complete flow**
7. **Monitor email delivery and verification rates**
8. **Request AWS SES production access for higher sending limits**

The system is now ready to automatically notify the pathology team about new bookings using AWS SES and escalate if needed!
