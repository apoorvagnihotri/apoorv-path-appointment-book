-- Keep only two technicians with given names and phone numbers; deactivate others
-- Idempotent-ish: try to upsert by name

-- Ensure technicians table exists (this migration assumes previous migration created it)

-- Upsert the two desired technicians without relying on a unique constraint

-- DURPAL SINGH KUSHRAM
UPDATE public.technicians
SET phone = '7610259348', is_active = true, updated_at = now()
WHERE name = 'DURPAL SINGH KUSHRAM';

INSERT INTO public.technicians (name, phone, is_active)
SELECT 'DURPAL SINGH KUSHRAM', '7610259348', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.technicians WHERE name = 'DURPAL SINGH KUSHRAM'
);

-- ASHISH SONAKIYA
UPDATE public.technicians
SET phone = '8770276578', is_active = true, updated_at = now()
WHERE name = 'ASHISH SONAKIYA';

INSERT INTO public.technicians (name, phone, is_active)
SELECT 'ASHISH SONAKIYA', '8770276578', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.technicians WHERE name = 'ASHISH SONAKIYA'
);

-- Deactivate any other technicians not in this set
UPDATE public.technicians
SET is_active = false, updated_at = now()
WHERE name NOT IN ('DURPAL SINGH KUSHRAM', 'ASHISH SONAKIYA');
