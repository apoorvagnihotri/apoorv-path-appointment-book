/// <reference types="https://deno.land/x/deno/cli/types/deno.d.ts" />

// WhatsApp Webhook (Meta Cloud API) for registration via WhatsApp
// - Verifies webhook (GET)
// - Handles inbound messages (POST)
// - OTP flow: REGISTER -> send template -> verify -> collect minimal profile
// - Persists session state in public.whatsapp_sessions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const META_WA_TOKEN = Deno.env.get('META_WA_TOKEN') // permanent token
const WA_PHONE_NUMBER_ID = Deno.env.get('WA_PHONE_NUMBER_ID')
const VERIFY_TOKEN = Deno.env.get('VERIFY_TOKEN') || 'verify-token-placeholder'
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Helpers
const e164 = (num: string) => {
  const digits = num.replace(/\D/g, '')
  if (digits.startsWith('91')) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 11) return `+91${digits.slice(1)}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

const hash = async (value: string) => {
  const enc = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

async function sendTemplate(to: string, template: { name: string; language: string; variables?: string[] }) {
  if (!META_WA_TOKEN || !WA_PHONE_NUMBER_ID) throw new Error('Meta WA env not configured')
  const components = template.variables && template.variables.length
    ? [{ type: 'body', parameters: template.variables.map(v => ({ type: 'text', text: v })) }]
    : undefined
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template.name,
      language: { code: template.language },
      ...(components ? { components } : {})
    }
  }
  const url = `https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${META_WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('WA sendTemplate error', data)
    throw new Error(`WA template send failed: ${res.status}`)
  }
  return data
}

async function sendText(to: string, body: string) {
  if (!META_WA_TOKEN || !WA_PHONE_NUMBER_ID) throw new Error('Meta WA env not configured')
  const url = `https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${META_WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('WA sendText error', data)
    throw new Error(`WA text send failed: ${res.status}`)
  }
  return data
}

async function getOrCreateSession(waNumber: string) {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('wa_number', waNumber)
    .maybeSingle()
  if (error) throw error
  if (data) return data
  const { data: created, error: insertError } = await supabase
    .from('whatsapp_sessions')
    .insert({ wa_number: waNumber, state: 'idle' })
    .select('*')
    .single()
  if (insertError) throw insertError
  return created
}

async function updateSession(waNumber: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update(patch)
    .eq('wa_number', waNumber)
  if (error) throw error
}

async function handleRegister(wa: string) {
  const session = await getOrCreateSession(wa)
  const code = generateOtp()
  const otpHash = await hash(code)
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await updateSession(wa, { state: 'awaiting_otp', otp_hash: otpHash, attempts: 0, expires_at: expires })
  try {
    await sendTemplate(wa, { name: 'auth_otp', language: 'en_US', variables: [code] })
  } catch (e) {
    console.warn('Template auth_otp failed, falling back to text OTP', e)
    await sendText(wa, `Your Apoorv Path Labs code is ${code}. It expires in 10 minutes. Do not share.`)
  }
  await sendText(wa, 'Please reply with the 6-digit code to verify. Type RESEND to get a new code.')
}

async function handleOtp(wa: string, text: string) {
  const { data: session, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('wa_number', wa)
    .single()
  if (error || !session) throw new Error('Session not found')

  if (text.trim().toUpperCase() === 'RESEND') {
    return await handleRegister(wa)
  }

  if (!/^[0-9]{6}$/.test(text.trim())) {
    await sendText(wa, 'Invalid code format. Please enter the 6-digit code sent to you.')
    return
  }

  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    await sendText(wa, 'Code expired. Sending a new code...')
    return await handleRegister(wa)
  }

  const inputHash = await hash(text.trim())
  if (inputHash !== session.otp_hash) {
    const attempts = (session.attempts || 0) + 1
    await updateSession(wa, { attempts })
    if (attempts >= 5) {
      await updateSession(wa, { state: 'idle', otp_hash: null, expires_at: null, attempts: 0 })
      await sendText(wa, 'Too many attempts. Please type REGISTER to start again.')
    } else {
      await sendText(wa, `Incorrect code. Attempts left: ${5 - attempts}`)
    }
    return
  }

  await updateSession(wa, { state: 'collecting_profile', otp_hash: null, expires_at: null })
  await sendText(wa, 'Verified ✅\nPlease enter your full name:')
}

async function handleProfileCollection(wa: string, text: string) {
  // Minimal: ask name → ask pincode → done
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('wa_number', wa)
    .single()

  const data = session?.data_json || {}
  if (!data.name) {
    data.name = text.trim()
    await updateSession(wa, { data_json: data })
    await sendText(wa, 'Thanks. Please enter your pincode:')
    return
  }
  if (!data.pincode) {
    const pin = text.replace(/\D/g, '')
    if (pin.length !== 6) {
      await sendText(wa, 'Please enter a valid 6-digit pincode:')
      return
    }
    data.pincode = pin
    await updateSession(wa, { data_json: data })
    // Create or link patient profile here (simplified placeholder)
    // In real implementation, insert into patients/members table and generate patient ID
    const patientId = crypto.randomUUID().slice(0, 8)
    await updateSession(wa, { state: 'done' })
    // Send confirmation template (registration_success)
    try {
      await sendTemplate(wa, { name: 'registration_success', language: 'en_US', variables: [data.name, patientId, `${SITE_URL}/tests`] })
    } catch (_) {
      await sendText(wa, `Registration complete. Patient ID: ${patientId}. Book tests: ${SITE_URL}/tests`)
    }
    return
  }
  // Already collected
  await sendText(wa, 'You are already registered. Reply HELP for options.')
}

function parseIncoming(body: any): Array<{ wa: string; text?: string; type: string }> {
  const events: Array<{ wa: string; text?: string; type: string }> = []
  try {
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const messages = changes?.value?.messages
    if (Array.isArray(messages)) {
      for (const m of messages) {
        const from = e164(m.from)
        if (m.type === 'text') {
          events.push({ wa: from, text: m.text?.body || '', type: 'text' })
        } else if (m.type === 'button' && m.button?.text) {
          events.push({ wa: from, text: m.button.text, type: 'button' })
        } else if (m.type === 'interactive') {
          const reply = m.interactive?.button_reply?.title || m.interactive?.list_reply?.title
          events.push({ wa: from, text: reply, type: 'interactive' })
        } else {
          events.push({ wa: from, type: m.type })
        }
      }
    }
  } catch (e) {
    console.error('parseIncoming error', e)
  }
  return events
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Webhook verification (Meta GET challenge)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new Response(challenge || '', { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const events = parseIncoming(body)
    for (const evt of events) {
      const text = (evt.text || '').trim()
      const upper = text.toUpperCase()
      if (upper === 'REGISTER' || upper === 'SIGNUP' || upper === 'START') {
        await handleRegister(evt.wa)
        continue
      }
      // Load session to route state
      const { data: session } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('wa_number', evt.wa)
        .maybeSingle()
      const state = session?.state || 'idle'
      if (state === 'awaiting_otp') {
        await handleOtp(evt.wa, text)
      } else if (state === 'collecting_profile') {
        await handleProfileCollection(evt.wa, text)
      } else if (state === 'done') {
        if (upper === 'HELP') {
          await sendText(evt.wa, `Options:\n1) Book tests: ${SITE_URL}/tests\n2) View profile: ${SITE_URL}/profile`)
        } else {
          await sendText(evt.wa, 'You are already registered. Reply HELP for options.')
        }
      } else {
        // Idle state
        await sendText(evt.wa, 'Welcome to Apoorv Pathology Lab. Type REGISTER to create your account.')
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e) {
    console.error('whatsapp-webhook error', e)
    return new Response(JSON.stringify({ error: e.message || 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
})
