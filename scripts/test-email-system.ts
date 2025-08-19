import { EmailNotificationService } from '../src/lib/emailNotificationService';
import { supabase } from '../src/integrations/supabase/client';

/**
 * Test script for email notification system
 * Run this to test the email flow without creating real orders
 */

async function testEmailNotificationSystem() {
  console.log('🧪 Starting Email Notification System Test...\n');

  // Test data - replace with real test data
  const testOrderData = {
    orderId: 'test-order-' + Date.now(),
    recipientEmail: 'apoorvpath@gmail.com', // Change to your test email
    emailType: 'booking_notification' as const,
    orderDetails: {
      orderNumber: 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91-9876543210',
      totalAmount: 1500,
      appointmentDate: '2025-08-20',
      appointmentTime: '09:00 AM',
      collectionType: 'home',
      collectionAddress: {
        first_name: 'Test',
        last_name: 'Customer',
        phone: '+91-9876543210',
        street_address: '123 Test Street',
        city: 'Test City',
        pincode: '123456',
        landmark: 'Near Test Landmark'
      },
      items: [
        {
          name: 'Complete Blood Count (CBC)',
          price: 500,
          memberName: 'Test Customer'
        },
        {
          name: 'Lipid Profile',
          price: 800,
          memberName: 'Test Customer'
        },
        {
          name: 'Home Collection Charges',
          price: 200,
          memberName: undefined
        }
      ]
    }
  };

  try {
    // Step 1: Test email sending
    console.log('📧 Step 1: Testing email notification sending...');
    const emailResult = await EmailNotificationService.sendBookingNotification(testOrderData);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('📋 Verification Token:', emailResult.verificationToken);
      console.log('🔗 Verification URL:', `https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/verify-email?token=${emailResult.verificationToken}\n`);
    } else {
      console.error('❌ Email sending failed:', emailResult.error);
      return;
    }

    // Step 2: Test verification (optional - uncomment to auto-verify)
    /*
    console.log('✅ Step 2: Testing email verification...');
    const verificationResult = await EmailNotificationService.verifyEmail(emailResult.verificationToken!);
    
    if (verificationResult) {
      console.log('✅ Email verified successfully!\n');
    } else {
      console.log('❌ Email verification failed\n');
    }
    */

    // Step 3: Test escalation check
    console.log('🔍 Step 3: Testing escalation check...');
    const escalationEmails = await EmailNotificationService.getEmailsNeedingEscalation();
    console.log('📊 Emails needing escalation:', escalationEmails.length);
    
    if (escalationEmails.length > 0) {
      console.log('📋 Escalation candidates:', escalationEmails);
    }

    // Step 4: Test escalation processing (optional - only run if you want to test escalation)
    /*
    console.log('\n🚨 Step 4: Testing escalation processing...');
    await EmailNotificationService.processEscalations();
    console.log('✅ Escalation processing completed');
    */

    console.log('\n✅ Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your email at apoorvpath@gmail.com');
    console.log('2. Click the verification link in the email');
    console.log('3. If you want to test escalation, wait 2+ hours or modify the timeout');
    console.log('4. Run the escalation processor to send escalation emails');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Manual verification test function
async function testEmailVerification(verificationToken: string) {
  console.log('🔍 Testing email verification for token:', verificationToken);
  
  const result = await EmailNotificationService.verifyEmail(verificationToken);
  
  if (result) {
    console.log('✅ Email verification successful');
  } else {
    console.log('❌ Email verification failed');
  }
}

// Manual escalation test function
async function testEscalationProcessing() {
  console.log('🚨 Testing escalation processing...');
  
  await EmailNotificationService.processEscalations();
  console.log('✅ Escalation processing completed');
}

// Check email notification status
async function checkEmailStatus() {
  console.log('📊 Checking email notification status...');
  
  const { data: notifications, error } = await supabase
    .from('email_notifications')
    .select(`
      *,
      email_escalations(*)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching notifications:', error);
    return;
  }

  console.log('📧 Recent email notifications:');
  notifications?.forEach((notification: any) => {
    console.log(`- ${notification.id}: ${notification.status} to ${notification.recipient_email} (${notification.email_type})`);
    if (notification.verified_at) {
      console.log(`  ✅ Verified at: ${notification.verified_at}`);
    }
    if (notification.email_escalations?.length > 0) {
      console.log(`  🚨 Escalation created: ${notification.email_escalations[0].created_at}`);
    }
  });
}

// Export functions for individual testing
export {
  testEmailNotificationSystem,
  testEmailVerification,
  testEscalationProcessing,
  checkEmailStatus
};

// Run test if called directly
if (require.main === module) {
  testEmailNotificationSystem().catch(console.error);
}
