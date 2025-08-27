# AWS SES Configuration Guide

This guide provides detailed steps for setting up AWS SES (Simple Email Service) for the Apoorv Pathology booking notification system.

## 🎯 Overview

AWS SES is used as the primary email service for:
- Booking confirmation emails to `office@bookings.apoorvpathology.com`
- Escalation emails to `deepaagni@gmail.com`
- Email verification tracking and management

## 🚀 Step-by-Step Setup

### Step 1: AWS Account Setup

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Navigate to SES**: Search for "SES" or go to Simple Email Service
3. **Choose Region**: Select `us-east-2` (Ohio) for optimal performance

### Step 2: Domain Verification

1. **Add Domain Identity**:
   ```
   Go to: SES Console → Verified identities → Create identity
   Choose: Domain
   Domain name: bookings.apoorvpathology.com
   ```

2. **Add DNS Records**:
   AWS will provide DNS records to add to your domain:
   ```bash
   # Example DNS records (your actual values will be different)
   
   # Domain verification CNAME
   _amazonses.bookings.apoorvpathology.com CNAME [verification-string].dkim.amazonses.com
   
   # DKIM records for authentication
   [selector1]._domainkey.bookings.apoorvpathology.com CNAME [dkim-value1].dkim.amazonses.com
   [selector2]._domainkey.bookings.apoorvpathology.com CNAME [dkim-value2].dkim.amazonses.com
   [selector3]._domainkey.bookings.apoorvpathology.com CNAME [dkim-value3].dkim.amazonses.com
   ```

3. **Add Email Security Records**:
   ```bash
   # SPF Record (TXT)
   bookings.apoorvpathology.com TXT "v=spf1 include:amazonses.com ~all"
   
   # DMARC Record (TXT)
   _dmarc.bookings.apoorvpathology.com TXT "v=DMARC1; p=quarantine; rua=mailto:postmaster@apoorvpathology.com"
   ```

### Step 3: Production Access Request

**Why needed?**: New AWS SES accounts start in "sandbox mode" with limitations:
- Can only send to verified email addresses
- Maximum 200 emails per 24 hours
- Maximum 1 email per second

**Request Process**:
1. Go to: SES Console → Account Dashboard → "Request production access"
2. Fill out the form:
   ```
   Mail type: Transactional
   Website URL: https://bookings.apoorvpathology.com
   Use case description: 
   "Medical pathology lab booking confirmation system. 
   Sends automated booking confirmations and notifications to lab staff. 
   Low volume (estimated 50-100 emails/day). 
   All emails are expected and requested by users."
   
   Additional contact info: [your business email]
   ```
3. **Approval time**: Usually 1-2 business days
4. **Result**: Increased limits (typically 50,000 emails/day)

### Step 4: IAM User Creation

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/
2. **Create User**:
   ```
   Username: apoorv-pathology-ses-user
   Access type: Programmatic access (Access key)
   ```

3. **Attach Policy**:
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
                   "ses:GetSendStatistics",
                   "ses:GetIdentityVerificationAttributes"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

4. **Save Credentials**:
   ```
   Access Key ID: AKIAXXXXXXXXXXXXXXXX
   Secret Access Key: [keep this secure]
   ```

### Step 5: Environment Variables Setup

In Supabase Dashboard → Settings → Edge Functions → Environment Variables:

```bash
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-2
```

### Step 6: Testing

1. **Verify Domain Status**:
   ```bash
   aws ses get-identity-verification-attributes \
     --identities bookings.apoorvpathology.com \
     --region us-east-2
   ```

2. **Check Sending Quota**:
   ```bash
   aws ses get-send-quota --region us-east-2
   ```

3. **Test Email Sending**:
   ```bash
   aws ses send-email \
     --source "office@bookings.apoorvpathology.com" \
     --destination "ToAddresses=your-test-email@example.com" \
     --message "Subject={Data=Test Email},Body={Text={Data='Test message from SES'}}" \
     --region us-east-2
   ```

## 📊 Monitoring & Management

### Sending Statistics
```bash
# Check sending statistics
aws ses get-send-statistics --region us-east-2

# Check bounce and complaint rates
aws ses get-reputation --region us-east-2
```

### Important Metrics to Monitor:
- **Bounce Rate**: Should be < 5%
- **Complaint Rate**: Should be < 0.1%
- **Delivery Rate**: Should be > 95%

### Reputation Management:
- AWS automatically monitors your sending reputation
- High bounce/complaint rates can result in sending suspension
- Use verified email addresses for testing
- Implement proper unsubscribe mechanisms

## 🔧 Configuration Files

The system automatically handles:
- AWS Signature V4 authentication
- Proper email formatting and headers
- Error handling and retries
- Fallback to Resend if needed

## 🚨 Troubleshooting

### Common Issues:

1. **"MessageRejected" Error**:
   - Verify domain is confirmed in SES Console
   - Check if still in sandbox mode
   - Ensure recipient email is verified (in sandbox mode)

2. **"AccessDenied" Error**:
   - Check IAM permissions
   - Verify Access Key ID and Secret Key
   - Confirm region matches

3. **DNS Verification Issues**:
   - Allow 24-48 hours for DNS propagation
   - Verify DNS records are added correctly
   - Use DNS lookup tools to confirm records

4. **High Bounce Rate**:
   - Validate email addresses before sending
   - Implement email verification for user accounts
   - Monitor bounce notifications

### Getting Help:
- AWS Support (if you have a support plan)
- AWS SES Documentation: https://docs.aws.amazon.com/ses/
- Stack Overflow: #amazon-ses tag

## 💡 Best Practices

1. **Always use verified domains** for from addresses
2. **Monitor bounce and complaint rates** regularly
3. **Implement proper email authentication** (SPF, DKIM, DMARC)
4. **Use meaningful from addresses** and subject lines
5. **Respect recipient preferences** and implement unsubscribe
6. **Test thoroughly** before production deployment

## 🎉 Success Indicators

✅ Domain verification status: "Success"  
✅ DKIM authentication: "Success"  
✅ Production access: "Granted"  
✅ Test emails: "Delivered successfully"  
✅ Bounce rate: < 5%  
✅ Complaint rate: < 0.1%  

Your AWS SES setup is complete and ready for production use!
