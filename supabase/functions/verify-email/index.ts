import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invalid Verification Link</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f4f4f4; }
                .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
                .error { color: #dc2626; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="error">❌ Invalid Link</h1>
                <p>This verification link is invalid or malformed.</p>
            </div>
        </body>
        </html>
        `,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 400,
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the email notification
    const { data: verified, error } = await supabase
      .rpc('mark_email_as_verified', { token })

    if (error) {
      console.error('Verification error:', error)
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verification Error</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f4f4f4; }
                .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
                .error { color: #dc2626; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="error">❌ Verification Failed</h1>
                <p>There was an error verifying your email. Please contact support.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        </body>
        </html>
        `,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 500,
        }
      )
    }

    if (!verified) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Link Expired or Invalid</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f4f4f4; }
                .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
                .warning { color: #f59e0b; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="warning">⚠️ Link Not Found</h1>
                <p>This verification link has expired, has already been used, or is invalid.</p>
                <p>If you need assistance, please contact our support team.</p>
            </div>
        </body>
        </html>
        `,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 404,
        }
      )
    }

    // Get the verified notification details for display
    const { data: notification } = await supabase
      .from('email_notifications')
      .select(`
        order_id,
        recipient_email,
        email_type,
        orders (
          order_number,
          customer_details
        )
      `)
      .eq('verification_token', token)
      .single()

    const orderNumber = notification?.orders?.order_number || 'Unknown'
    const customerName = notification?.orders?.customer_details?.name || 'Customer'
    const isEscalation = notification?.email_type === 'escalation'

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Email Verified Successfully</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f4f4f4; }
              .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
              .success { color: #16a34a; }
              .info { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .next-steps { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .btn { background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 class="success">✅ Email Verified Successfully!</h1>
              
              <div class="info">
                  <h3>📋 Booking Confirmed</h3>
                  <p><strong>Order:</strong> #${orderNumber}</p>
                  <p><strong>Customer:</strong> ${customerName}</p>
                  <p><strong>Verified by:</strong> ${notification?.recipient_email}</p>
                  ${isEscalation ? '<p><strong>Type:</strong> 🚨 Escalated Booking</p>' : ''}
              </div>

              <div class="next-steps">
                  <h3>📝 Next Steps:</h3>
                  <ul>
                      <li>Review the booking details in your system</li>
                      <li>${isEscalation ? 'Assign this booking to a lab technician immediately' : 'Schedule the sample collection if needed'}</li>
                      <li>Contact the customer if any clarifications are needed</li>
                      <li>Update the booking status as work progresses</li>
                  </ul>
              </div>

              <div style="margin-top: 30px;">
                  <a href="mailto:${notification?.orders?.customer_details?.email || ''}" class="btn">📧 Contact Customer</a>
                  ${notification?.orders?.customer_details?.phone ? 
                    `<a href="tel:${notification.orders.customer_details.phone}" class="btn">📞 Call Customer</a>` : ''
                  }
              </div>

              <div style="margin-top: 30px; color: #666; font-size: 14px;">
                  <p>🏥 Apoorv Pathology Lab - Booking Management System</p>
                  <p>Verified at: ${new Date().toLocaleString()}</p>
              </div>
          </div>
      </body>
      </html>
      `,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in verify-email function:', error)
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
          <title>System Error</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f4f4f4; }
              .container { background: white; padding: 40px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
              .error { color: #dc2626; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 class="error">❌ System Error</h1>
              <p>There was an unexpected error processing your request.</p>
              <p>Please try again later or contact support.</p>
          </div>
      </body>
      </html>
      `,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      }
    )
  }
})
