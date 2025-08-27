#!/usr/bin/env node

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const FROM_EMAIL = 'apoorvagni@gmail.com'; // Use verified email for testing
const TO_EMAIL = process.env.TEST_EMAIL || 'apoorvagni@gmail.com'; // Change this to your email

// Validate environment variables
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ Missing AWS credentials in environment variables');
  console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
  process.exit(1);
}

// Create SES client
const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Email content
const emailParams = {
  Source: `Apoorv Pathology <${FROM_EMAIL}>`,
  Destination: {
    ToAddresses: [TO_EMAIL],
  },
  Message: {
    Subject: {
      Data: '🧪 AWS SES Test Email - Apoorv Pathology',
      Charset: 'UTF-8',
    },
    Body: {
      Html: {
        Data: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>AWS SES Test</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">🧪 AWS SES Test Successful!</h1>
              
              <p>Hello!</p>
              
              <p>This is a test email sent from <strong>Apoorv Pathology</strong> using Amazon SES.</p>
              
              <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #0369a1;">✅ Test Details:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>From:</strong> ${FROM_EMAIL}</li>
                  <li><strong>To:</strong> ${TO_EMAIL}</li>
                  <li><strong>Region:</strong> ${AWS_REGION}</li>
                  <li><strong>Time:</strong> ${new Date().toISOString()}</li>
                </ul>
              </div>
              
              <p>If you received this email, your AWS SES configuration is working correctly! 🎉</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280;">
                This is a test email from Apoorv Pathology Lab booking system.<br>
                If you received this by mistake, please ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
        Charset: 'UTF-8',
      },
      Text: {
        Data: `
AWS SES Test Email - Apoorv Pathology

Hello!

This is a test email sent from Apoorv Pathology using Amazon SES.

Test Details:
- From: ${FROM_EMAIL}
- To: ${TO_EMAIL}
- Region: ${AWS_REGION}
- Time: ${new Date().toISOString()}

If you received this email, your AWS SES configuration is working correctly!

---
This is a test email from Apoorv Pathology Lab booking system.
If you received this by mistake, please ignore this email.
        `,
        Charset: 'UTF-8',
      },
    },
  },
  Tags: [
    { Name: 'Type', Value: 'test' },
    { Name: 'Source', Value: 'test-script' }
  ]
};

async function sendTestEmail() {
  console.log('🚀 Starting AWS SES test...');
  console.log(`📧 Sending from: ${FROM_EMAIL}`);
  console.log(`📬 Sending to: ${TO_EMAIL}`);
  console.log(`🌍 AWS Region: ${AWS_REGION}`);
  console.log('---');

  try {
    const command = new SendEmailCommand(emailParams);
    const result = await sesClient.send(command);
    
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${result.MessageId}`);
    console.log('---');
    console.log('💡 Tips:');
    console.log('- Check your email inbox (and spam folder)');
    console.log('- If you\'re in SES sandbox mode, ensure the recipient email is verified');
    console.log('- Check AWS SES console for sending statistics');
    
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(`Error: ${error.message}`);
    
    if (error.name === 'MessageRejected') {
      console.error('💡 This might be because:');
      console.error('- Your SES account is in sandbox mode and the recipient email is not verified');
      console.error('- The sender email domain is not verified');
      console.error('- Check AWS SES console for more details');
    }
    
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
