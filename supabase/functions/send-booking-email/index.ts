import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  notificationId: string;
  verificationToken: string;
  emailData: {
    orderId: string;
    recipientEmail: string;
    emailType: 'booking_notification' | 'escalation';
    orderDetails: {
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      totalAmount: number;
      appointmentDate?: string;
      appointmentTime?: string;
      collectionType: string;
      collectionAddress?: any;
      items: Array<{
        name: string;
        price: number;
        memberName?: string;
      }>;
    };
  };
}

// HTML Email Template
function createBookingEmailTemplate(data: EmailData): string {
  console.log('Template function received data:', JSON.stringify(data, null, 2))
  
  const { verificationToken, emailData } = data;
  
  if (!emailData) {
    throw new Error('emailData is missing from the request')
  }
  
  const { orderDetails } = emailData;
  
  if (!orderDetails) {
    throw new Error('orderDetails is missing from emailData')
  }
  
  const isEscalation = emailData.emailType === 'escalation';
  
  const verificationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-email?token=${verificationToken}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isEscalation ? 'URGENT: Unverified' : 'New'} Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .alert { background: ${isEscalation ? '#fef2f2' : '#f0f9ff'}; border: 1px solid ${isEscalation ? '#fecaca' : '#bae6fd'}; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .verification-btn { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 18px; color: #dc2626; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isEscalation ? '🚨 URGENT: Unverified Booking' : '🧬 New Pathology Booking'}</h1>
            <p>Order #${orderDetails.orderNumber}</p>
        </div>

        ${isEscalation ? `
        <div class="alert">
            <h3>⚠️ ESCALATION NOTICE</h3>
            <p>This booking notification was sent to <strong>apoorvpath@gmail.com</strong> but hasn't been verified. Please review and assign to a lab technician immediately.</p>
        </div>
        ` : `
        <div class="alert">
            <h3>📋 New Booking Received</h3>
            <p>A new pathology test booking has been confirmed and requires your attention.</p>
        </div>
        `}

        <div class="details">
            <h3>👤 Customer Details</h3>
            <p><strong>Name:</strong> ${orderDetails.customerName}</p>
            <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
            ${orderDetails.customerPhone ? `<p><strong>Phone:</strong> ${orderDetails.customerPhone}</p>` : ''}
        </div>

        <div class="details">
            <h3>📅 Appointment Details</h3>
            <p><strong>Collection Type:</strong> ${orderDetails.collectionType === 'home' ? 'Home Collection' : 'Lab Collection'}</p>
            ${orderDetails.appointmentDate ? `<p><strong>Date:</strong> ${orderDetails.appointmentDate}</p>` : ''}
            ${orderDetails.appointmentTime ? `<p><strong>Time:</strong> ${orderDetails.appointmentTime}</p>` : ''}
            
            ${orderDetails.collectionAddress ? `
            <p><strong>Address:</strong><br>
            ${orderDetails.collectionAddress.first_name} ${orderDetails.collectionAddress.last_name}<br>
            ${orderDetails.collectionAddress.street_address}<br>
            ${orderDetails.collectionAddress.city} - ${orderDetails.collectionAddress.pincode}<br>
            ${orderDetails.collectionAddress.landmark ? `Landmark: ${orderDetails.collectionAddress.landmark}<br>` : ''}
            Phone: ${orderDetails.collectionAddress.phone}
            </p>
            ` : ''}
        </div>

        <div class="details">
            <h3>🧪 Tests Ordered</h3>
            ${orderDetails.items.map(item => `
            <div class="item">
                <strong>${item.name}</strong>
                ${item.memberName ? `<br><small>For: ${item.memberName}</small>` : ''}
                <span style="float: right;">₹${item.price}</span>
            </div>
            `).join('')}
            <div class="item total">
                Total Amount: ₹${orderDetails.totalAmount}
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="verification-btn">
                ${isEscalation ? '✅ ACKNOWLEDGE & ASSIGN' : '✅ CONFIRM RECEIVED'}
            </a>
            <p style="font-size: 12px; color: #666;">
                Click the button above to confirm you've received and reviewed this booking.
                ${isEscalation ? ' This will prevent further escalations.' : ' If not confirmed within 2 hours, this will be escalated.'}
            </p>
        </div>

        <div class="footer">
            <p>🏥 Apoorv Pathology Lab</p>
            <p style="font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
            <p style="font-size: 10px;">Booking ID: ${data.emailData.orderId}</p>
        </div>
    </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('Received request body:', JSON.stringify(requestBody, null, 2))
    
    const { notificationId, verificationToken, emailData }: EmailData = requestBody

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Create email content
    const htmlContent = createBookingEmailTemplate({
      notificationId,
      verificationToken,
      emailData
    })

    const isEscalation = emailData.emailType === 'escalation';
    const subject = isEscalation 
      ? `🚨 URGENT: Unverified Booking - Order #${emailData.orderDetails.orderNumber}`
      : `🧬 New Booking Confirmation - Order #${emailData.orderDetails.orderNumber}`;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Apoorv Pathology <office@apoorvpathology.com>',
        to: [emailData.recipientEmail],
        subject: subject,
        html: htmlContent,
        tags: [
          { name: 'type', value: emailData.emailType },
          { name: 'order_id', value: emailData.orderId }
        ]
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Resend API error: ${errorText}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: 'Email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-booking-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
