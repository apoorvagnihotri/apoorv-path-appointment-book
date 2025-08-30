# WhatsApp Registration Feature — Master Checklist and Definition of Done

Scope: Enable patient registration via WhatsApp (Cloud API, official Meta) for Jabalpur users; volume < 100 messages/day. Includes business setup, templates, webhook, OTP verification, minimal profile capture, Supabase integration, and operational readiness.

Last updated: 2025-08-30

---

## 1) Business assets and access
- Identify who owns the Meta Business Manager (BM) tied to number 9993522579
  - BM ID, primary admin, and technical admin access confirmed
  - If controlled by a vendor, arrange transfer or grant of admin + developer permissions
- Business verification in BM is completed
- Payment method added in BM (required for production sending)
- Confirm WhatsApp Business Account (WABA) exists or create one
- Display name is approved and matches branding (e.g., “Apoorv Path Labs”) and WhatsApp policy

## 2) Phone number readiness (9993522579)
- Check current status of 9993522579:
  - Is it registered on consumer WhatsApp or WhatsApp Business App? If yes, delete the account on-device (Settings → Account → Delete account) to free the number
  - Is it already attached to another WABA? If yes, request number migration or removal from that WABA
- Verify access to receive SMS/voice for OTP during onboarding (voice works for landlines)
- Confirm number supports E.164 formatting (+919993522579) and carrier allows WA registration

## 3) Meta WhatsApp Cloud API setup
- Create a Meta app and add the WhatsApp product
- Link app to WABA and add the phone number as a sender
- Create a System User (BM → Users → System users) with whatsapp_business_messaging permission
- Generate a long‑lived access token; store securely (no short‑lived user tokens)
- Record and store securely:
  - WABA ID
  - Phone Number ID
  - Business Account ID
  - Permanent access token (rotation policy noted)
- Set up Webhooks in the Meta app:
  - Callback URL and Verify Token configured
  - Subscriptions: messages, message_template_status_update, phone_number_name_update, account_update
  - Webhook verification handshake (GET) succeeds

## 4) Message templates (pre‑approved)
- Authentication category:
  - auth_otp: “Your Apoorv Path Labs code is {{1}}. It expires in 10 minutes. Do not share.”
    - Locale(s): en_US, hi_IN
    - Buttons (optional): Quick reply “Resend code”
- Utility category:
  - registration_success: “Hi {{1}}, your registration is complete. Patient ID: {{2}}. Book tests here: {{3}}”
  - booking_confirmation: “Booking {{1}} confirmed for {{2}} at {{3}}. View details: {{4}}”
  - booking_reminder: “Reminder: Booking {{1}} at {{2}}. Reply 1 to confirm, 2 to reschedule.”
- Names, copy, variables, locales finalized; all templates approved and not rejected; quality rating healthy
- Opt‑out phrasing decided (e.g., “Reply STOP to opt‑out”) and behavior implemented

## 5) Legal, privacy, consent
- Updated Privacy Policy mentions WhatsApp as a communication channel and data handling practices
- Consent/opt‑in captured:
  - For inbound initiation via wa.me link, implicit service window applies; store opt‑in timestamp
  - For outbound notifications outside 24h, ensure explicit opt‑in captured
- Avoid sending sensitive PHI over WhatsApp; move detailed medical info to secure web pages
- Data retention policy documented; deletion and export procedures defined

## 6) Architecture and infrastructure
- Supabase Edge Function: whatsapp-webhook
  - Handles GET (verification) and POST (messages)
  - Verifies request authenticity (verify token on subscription; log sender IDs; implement idempotency by WA message ID)
  - State machine for registration: idle → otp_sent → awaiting_otp → collecting_profile → done
- Outbound messaging utility calling Graph API v21.0
  - Retries with backoff on 429/5xx; handles 470/131044-style errors (template mismatch, no user opt‑in)
  - Stores WA message_id, conversation_id, and pricing where available
- Secrets stored via `supabase secrets`: META_WA_TOKEN, WA_PHONE_NUMBER_ID, META_WABA_ID, VERIFY_TOKEN
- Local development strategy:
  - Public tunnel for webhooks (e.g., Cloudflare Tunnel/ngrok) OR deployed dev function URL
  - Distinct dev templates or dev phone list (Meta dev mode limitation: only added test numbers receive)

## 7) Data model and migrations
- whatsapp_sessions table
  - id (uuid), wa_number (text, E.164 unique), state (text), otp_hash (text nullable), attempts (int), expires_at (timestamptz), data_json (jsonb), last_message_id (text), created_at, updated_at
- patients/members integration
  - Decide whether WA registration creates a Supabase auth user immediately or only a patient profile
  - Map fields: name, phone_e164, language, city, pincode, address minimal
  - Unique index on phone_e164; handle existing account merge
- audit_log for key events (otp_sent, otp_verified, profile_created)

## 8) User flows and UX
- Entry points
  - “Continue on WhatsApp” button on web (`Auth.tsx`/`Register.tsx`), linking to `https://wa.me/919993522579?text=REGISTER`
  - Optional QR code on desktop; clinic posters for offline
- Registration conversation
  - User sends REGISTER → send auth_otp → verify 6‑digit code → collect name and pincode (min) → optional address → confirmation message with link to profile/booking
- Edge cases
  - Resend OTP throttle; max attempts; expiration handling
  - Number already registered → send shortcut link and skip data collection
  - Linking to existing email account if email later provided; conflict resolution
  - STOP/UNSTOP handling recorded and respected

## 9) Security, fraud, and abuse prevention
- OTP: 6 digits, random, expires in 10 minutes; hash at rest (bcrypt/argon2)
- Rate limits per wa_number and IP (for web entry) to prevent brute force
- Idempotency keys using WA message_id to avoid duplicate state transitions
- Validate phone format and region; normalize to E.164
- Minimal PII in messages; links with short‑lived signed tokens
- Token rotation for META_WA_TOKEN; alert on near‑expiry

## 10) Observability and operations
- Structured logging for webhook events and outbound calls (request_id, wa_message_id, wa_number, state)
- Metrics: counts for received messages, OTP sent, OTP verified, drop/fail rates, template rejections, conversation categories used
- Alerts for error spikes, 429s, token expiry, webhook failures
- Runbook: how to rotate token, add templates/locales, add test numbers, migrate numbers

## 11) Testing and QA
- Dev mode recipients added to app for testing
- Unit tests for state machine transitions
- Integration tests using Meta’s test phone and real device
- Template rendering tests per locale; placeholder validation
- Manual QA scripts: positive, wrong OTP, expired OTP, resend, STOP, already registered, network failure, template not approved
- Load sanity: simulate 100 messages/day; confirm rate limit headroom

## 12) Rollout and comms
- Soft launch: internal numbers and a small patient cohort
- Monitor template quality rating for first week
- Publish updated Privacy Policy and in-app notice
- Prepare fallback SMS path for critical notifications if WA fails (optional)

## 13) Definition of Done (acceptance checklist)
- Business & number
  - [ ] BM admin access; business verified; payment method added
  - [ ] 9993522579 attached to WABA and verified; display name approved
- Cloud API
  - [ ] Long‑lived token generated and stored as secret; rotation plan documented
  - [ ] Webhook URL live; verification OK; subscriptions active
- Templates
  - [ ] auth_otp approved (en_US, hi_IN)
  - [ ] registration_success approved; booking templates drafted/approved
- Backend
  - [ ] `whatsapp-webhook` function deployed; state machine implemented; persistence in `whatsapp_sessions`
  - [ ] Outbound sender utility working; retries and error handling implemented
  - [ ] Audit logs emitted; metrics dashboard available
- Data
  - [ ] Patients/members created/linked on successful flow; dedupe on phone
  - [ ] OTP hashed; rate limits enforced; idempotency implemented
- Frontend
  - [ ] “Continue on WhatsApp” button present on Register/Auth pages; QR code on desktop
  - [ ] Post‑registration confirmation page reachable from WA link
- Legal & Ops
  - [ ] Privacy Policy updated; opt‑out honored; STOP handling verified
  - [ ] Runbook written; alerts configured; smoke tests automated
- QA
  - [ ] Test plan executed across locales; edge cases pass
  - [ ] Soft launch complete; error budgets within limits for 1 week

## 14) Open questions to decide
- Auth model: Do we create a Supabase auth user for WA-only registration, or store a patient profile and ask for email/phone login later?
- Languages: English + Hindi? Any additional locales needed for templates and prompts?
- Data capture depth at registration: name + pincode only, or full address now vs later?
- Outbound notifications scope at launch: only registration success, or also booking confirmations/reminders?
- Opt‑out policy wordings and where to persist (global vs channel-specific)?
- Fallback channel: send SMS if WA fails or outside 24h without template?

## 15) Appendix — Template drafts (for submission)
- auth_otp (Authentication)
  - Body: “Your Apoorv Path Labs code is {{1}}. It expires in 10 minutes. Do not share.”
  - Variables: 1 = 6‑digit code
  - Locales: en_US, hi_IN (Hindi translation finalized)
- registration_success (Utility)
  - Body: “Hi {{1}}, your registration is complete. Patient ID: {{2}}. Book tests here: {{3}}”
  - Variables: 1 = name, 2 = patient id, 3 = booking link
- booking_confirmation (Utility)
  - Body: “Booking {{1}} confirmed for {{2}} at {{3}}. View details: {{4}}”
- booking_reminder (Utility)
  - Body: “Reminder: Booking {{1}} at {{2}}. Reply 1 to confirm, 2 to reschedule.”

## 16) Appendix — Webhook fields to handle (messages)
- message types: text, button, interactive, reaction
- statuses: sent, delivered, read, failed
- ids: message_id, conversation.id, pricing.category
- contacts: wa_id; profile.name
- errors: code, title, details (e.g., 131042/131026 template issues)

## 17) Appendix — Rate limits and budget
- Conversation pricing (India): track current Meta rates per category; set monthly budget alert
- Throughput: well below Cloud API limits; still implement exponential backoff for bursts
- Resend policy: max 3 OTP sends per 15 minutes per wa_number

---

Next action once this checklist is accepted: scaffold `supabase/functions/whatsapp-webhook` and add the “Continue on WhatsApp” CTA in the frontend, then iterate through the DoD items.
