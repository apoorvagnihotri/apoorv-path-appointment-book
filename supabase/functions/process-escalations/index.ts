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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get emails that need escalation
    const { data: emailsToEscalate, error: escalationError } = await supabase
      .rpc('get_emails_needing_escalation')

    if (escalationError) {
      throw new Error(`Failed to get escalation emails: ${escalationError.message}`)
    }

    if (!emailsToEscalate || emailsToEscalate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No emails need escalation at this time',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    let processedCount = 0
    const results = []

    for (const email of emailsToEscalate) {
      try {
        // Get original order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('id', email.order_id)
          .single()

        if (orderError || !order) {
          console.error('Error fetching order for escalation:', orderError)
          results.push({
            orderId: email.order_id,
            success: false,
            error: 'Failed to fetch order details'
          })
          continue
        }

        // Create escalation email data
        const escalationEmailData = {
          notificationId: crypto.randomUUID(),
          verificationToken: crypto.randomUUID(),
          emailData: {
            orderId: email.order_id,
            recipientEmail: 'deepaagni@gmail.com',
            emailType: 'escalation',
            orderDetails: {
              orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
              customerName: order.customer_details?.name || 'Customer',
              customerEmail: order.customer_details?.email || '',
              customerPhone: order.customer_details?.phone,
              totalAmount: order.total_amount,
              appointmentDate: order.appointment_date,
              appointmentTime: order.appointment_time,
              collectionType: order.collection_type,
              collectionAddress: order.collection_address,
              items: order.order_items?.map((item: any) => ({
                name: item.item_name,
                price: item.item_price,
                memberName: item.member_name
              })) || []
            }
          }
        }

        // Create escalation notification record
        const { data: escalationNotification, error: dbError } = await supabase
          .from('email_notifications')
          .insert({
            order_id: email.order_id,
            email_type: 'escalation',
            recipient_email: 'deepaagni@gmail.com',
            subject: `🚨 URGENT: Unverified Booking - Order #${escalationEmailData.emailData.orderDetails.orderNumber}`,
            status: 'pending',
            verification_token: escalationEmailData.verificationToken
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error creating escalation notification:', dbError)
          results.push({
            orderId: email.order_id,
            success: false,
            error: 'Failed to create escalation notification'
          })
          continue
        }

        // Call the email sending function
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: escalationNotification.id,
            verificationToken: escalationEmailData.verificationToken,
            emailData: escalationEmailData.emailData
          }),
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          throw new Error(`Email sending failed: ${errorText}`)
        }

        // Update escalation notification status to sent
        await supabase
          .from('email_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', escalationNotification.id)

        // Mark original escalation as processed
        await supabase
          .from('email_escalations')
          .update({ 
            escalated_at: new Date().toISOString(),
            escalation_notification_id: escalationNotification.id
          })
          .eq('original_notification_id', email.notification_id)

        processedCount++
        results.push({
          orderId: email.order_id,
          success: true,
          escalationNotificationId: escalationNotification.id
        })

      } catch (error) {
        console.error(`Error processing escalation for order ${email.order_id}:`, error)
        results.push({
          orderId: email.order_id,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} escalations`,
        processed: processedCount,
        total: emailsToEscalate.length,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in process-escalations function:', error)
    
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
