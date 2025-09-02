/// <reference types="https://deno.land/x/deno/cli/types/deno.d.ts" />

// This function verifies a WhatsApp OTP provided by the user on the frontend.
// 1. Receives a phone number and the OTP code.
// 2. Finds the corresponding session in `whatsapp_sessions`.
// 3. Securely compares the provided OTP with the stored hash.
// 4. If valid, it creates a new Supabase Auth user.
// 5. Returns a custom JWT for the frontend to log the user in.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Environment Variables ---
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET')

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

// --- Main Server Logic ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, code } = await req.json()
    if (!phone || !code) {
      throw new Error('Phone number and OTP code are required.')
    }
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured in environment variables.')
    }

    const waNumber = e164(phone)

    // 1. Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('wa_number', waNumber)
      .single()

    if (sessionError || !session) {
      throw new Error('No OTP session found for this number. Please request a new code.')
    }

    // 2. Check for expiry and attempts
    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw new Error('The OTP has expired. Please request a new one.')
    }
    if (session.attempts >= 5) {
      throw new Error('Maximum verification attempts reached. Please request a new code.')
    }

    // 3. Verify the OTP hash
    const inputHash = await hash(code)
    if (inputHash !== session.otp_hash) {
      // Increment attempts and fail
      await supabase
        .from('whatsapp_sessions')
        .update({ attempts: session.attempts + 1 })
        .eq('id', session.id)
      throw new Error('The code you entered is incorrect.')
    }

    // 4. OTP is valid. Create or find the Supabase Auth user.
    let user
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByPhone(waNumber)
    
    if (getUserError) {
        // User doesn't exist, create them
        const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
            phone: waNumber,
            phone_confirm: true, // Mark phone as verified since we did OTP
        })
        if (createUserError) {
            console.error('Error creating user:', createUserError)
            throw new Error('Failed to create a new user account.')
        }
        user = newUser.user
    } else {
        user = existingUser.user
    }

    // 5. Invalidate the OTP session
    await supabase
      .from('whatsapp_sessions')
      .update({ state: 'verified', otp_hash: null })
      .eq('id', session.id)

    // 6. Create a custom JWT to sign the user in on the frontend
    const customToken = await create(
        { alg: "HS256", typ: "JWT" },
        {
          sub: user.id,
          phone: user.phone,
          role: user.role,
          aud: "authenticated",
          exp: getNumericDate(new Date().getTime() + 60 * 60 * 1000), // 1 hour expiry
        },
        JWT_SECRET
      );

    return new Response(JSON.stringify({
      success: true,
      message: 'Verification successful.',
      token: customToken,
      user: user,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in verify-whatsapp-otp function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
