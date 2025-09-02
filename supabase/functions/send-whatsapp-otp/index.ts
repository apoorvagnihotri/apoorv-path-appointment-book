/// <reference types="https://deno.land/x/deno/cli/types/deno.d.ts" />

// This function sends a one-time password (OTP) to a user's WhatsApp number.
// It's called from the frontend when a user wants to register using their phone.
// 1. Receives a phone number.
// 2. Generates a 6-digit OTP.
// 3. Hashes the OTP and stores it with an expiry in the `whatsapp_sessions` table.
// 4. Sends the OTP to the user via a Meta WhatsApp template.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Environment Variables ---
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const META_WA_TOKEN = Deno.env.get('META_WA_TOKEN')
const WA_PHONE_NUMBER_ID = Deno.env.get('WA_PHONE_NUMBER_ID')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// --- Helper Functions ---
const e164 = (num: string) => {
  const digits = num.replace(/\D/g, '')
  if (digits.startsWith('91')) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

const hash = async (value: string) => {
  const enc = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

async function sendWhatsAppTemplate(to: string, template: { name: string; language: string; variables?: string[] }) {
  if (!META_WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials are not configured in environment variables.')
  }
  
  const components = template.variables?.length
    ? [{ type: 'body', parameters: template.variables.map(v => ({ type: 'text', text: v })) }]
    : undefined

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template.name,
      language: { code: template.language },
      ...(components && { components }),
    },
  }

  const url = `https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${META_WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json()
    console.error('Failed to send WhatsApp template:', errorData)
    throw new Error(`WhatsApp API request failed with status ${res.status}`)
  }
  return await res.json()
}

async function sendWhatsAppText(to: string, body: string) {
    if (!META_WA_TOKEN || !WA_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials are not configured.')
    }
    const url = `https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}/messages`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${META_WA_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
    })
    if (!res.ok) {
      const errorData = await res.json()
      console.error('Failed to send WhatsApp text:', errorData)
      throw new Error(`WhatsApp API text message failed with status ${res.status}`)
    }
    return await res.json()
  }

// --- Main Server Logic ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()
    if (!phone) {
      throw new Error('Phone number is required.')
    }

    const waNumber = e164(phone)
    const otp = generateOtp()
    const otpHash = await hash(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10-minute expiry

    // Upsert the session with the new OTP
    const { error: upsertError } = await supabase
      .from('whatsapp_sessions')
      .upsert(
        {
          wa_number: waNumber,
          state: 'awaiting_web_verification', // New state for this flow
          otp_hash: otpHash,
          expires_at: expiresAt,
          attempts: 0,
        },
        { onConflict: 'wa_number' }
      )

    if (upsertError) {
      console.error('Error upserting OTP session:', upsertError)
      throw new Error('Could not save OTP session.')
    }

    // Send the OTP via an approved WhatsApp template
    try {
        await sendWhatsAppTemplate(waNumber, {
            name: 'auth_otp', // Assumes you have a template with this name
            language: 'en_US',
            variables: [otp],
        })
    } catch (templateError) {
        console.warn('WhatsApp template message failed, falling back to plain text.', templateError.message)
        // Fallback to a plain text message if the template fails (e.g., not approved yet)
        await sendWhatsAppText(waNumber, `Your Apoorv Pathology Lab code is ${otp}. It expires in 10 minutes.`)
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP has been sent to your WhatsApp.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-whatsapp-otp function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
