#!/bin/bash

# Test email notification function directly
# Replace YOUR_SERVICE_ROLE_KEY with your actual service role key

curl -X POST https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "test-notification-123",
    "verificationToken": "test-token-456",
    "emailData": {
      "orderId": "test-order-123",
      "recipientEmail": "your-test-email@example.com",
      "emailType": "booking_notification",
      "orderDetails": {
        "orderNumber": "TEST-001",
        "customerName": "Test Customer",
        "customerEmail": "customer@example.com",
        "customerPhone": "+91-9876543210",
        "totalAmount": 1500,
        "appointmentDate": "2025-08-20",
        "appointmentTime": "09:00 AM",
        "collectionType": "home",
        "collectionAddress": {
          "first_name": "Test",
          "last_name": "Customer",
          "phone": "+91-9876543210",
          "street_address": "123 Test Street",
          "city": "Test City",
          "pincode": "123456",
          "landmark": "Near Test Landmark"
        },
        "items": [
          {
            "name": "Complete Blood Count (CBC)",
            "price": 500,
            "memberName": "Test Customer"
          },
          {
            "name": "Lipid Profile",
            "price": 800,
            "memberName": "Test Customer"
          },
          {
            "name": "Home Collection Charges",
            "price": 200
          }
        ]
      }
    }
  }'
