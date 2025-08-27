#!/bin/bash

# Email System Test Script
# Tests the AWS SES email notification system

echo "📧 Testing Email Notification System"
echo "====================================="

# Check if required environment variables are set
SUPABASE_URL="https://wvjcpyijakskshhfyrkv.supabase.co"
SUPABASE_FUNCTION_URL="${SUPABASE_URL}/functions/v1"

# Check if service role key is provided
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set"
    echo "Please export your service role key:"
    echo "export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    exit 1
fi

echo "🧪 Testing send-booking-email function..."

# Test payload
TEST_PAYLOAD='{
  "notificationId": "test-notification-123",
  "verificationToken": "test-token-456",
  "emailData": {
    "orderId": "test-order-789",
    "recipientEmail": "test@example.com",
    "emailType": "booking_notification",
    "orderDetails": {
      "orderNumber": "TEST-001",
      "customerName": "Test Customer",
      "customerEmail": "customer@example.com",
      "customerPhone": "+91-9876543210",
      "totalAmount": 1500,
      "appointmentDate": "2025-01-15",
      "appointmentTime": "10:00 AM",
      "collectionType": "home",
      "collectionAddress": {
        "first_name": "Test",
        "last_name": "Customer",
        "street_address": "123 Test Street",
        "city": "Test City",
        "pincode": "123456",
        "phone": "+91-9876543210",
        "landmark": "Near Test Hospital"
      },
      "items": [
        {
          "name": "Complete Blood Count (CBC)",
          "price": 500,
          "memberName": "Test Customer"
        },
        {
          "name": "Lipid Profile",
          "price": 800
        },
        {
          "name": "Thyroid Function Test",
          "price": 200
        }
      ]
    }
  }
}'

# Send test request
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  "$SUPABASE_FUNCTION_URL/send-booking-email")

# Extract HTTP status code and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
HTTP_BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $HTTP_BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Email function test passed!"
    
    # Extract email ID from response if available
    EMAIL_ID=$(echo $HTTP_BODY | grep -o '"emailId":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$EMAIL_ID" ]; then
        echo "📧 Email ID: $EMAIL_ID"
    fi
    
    echo ""
    echo "🔍 Testing verify-email function..."
    
    # Test verification endpoint
    VERIFY_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
      -X GET \
      "$SUPABASE_FUNCTION_URL/verify-email?token=test-token-456")
    
    VERIFY_STATUS=$(echo $VERIFY_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    echo "Verification Status: $VERIFY_STATUS"
    
    if [ "$VERIFY_STATUS" -eq 200 ] || [ "$VERIFY_STATUS" -eq 404 ]; then
        echo "✅ Verification function is accessible"
    else
        echo "⚠️ Verification function returned status: $VERIFY_STATUS"
    fi
    
else
    echo "❌ Email function test failed!"
    echo "Response body: $HTTP_BODY"
    
    # Provide helpful debugging information
    echo ""
    echo "🔧 Debugging steps:"
    echo "1. Check environment variables in Supabase Dashboard:"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - AWS_REGION"
    echo ""
    echo "2. Verify domain in AWS SES Console:"
    echo "   - bookings.apoorvpathology.com should be verified"
    echo ""
    echo "3. Check function logs in Supabase Dashboard:"
    echo "   - Go to Edge Functions > send-booking-email > Logs"
    echo ""
    echo "4. Ensure AWS SES is not in sandbox mode"
fi

echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - EMAIL_NOTIFICATION_SETUP.md"
echo "   - AWS_SES_SETUP.md"
