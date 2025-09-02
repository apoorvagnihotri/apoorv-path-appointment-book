-- Add two more technicians and ensure only the four desired are active

-- GANESH KUSHWAHA
UPDATE public.technicians
SET phone = '8982166401', is_active = true, updated_at = now()
WHERE name = 'GANESH KUSHWAHA';

INSERT INTO public.technicians (name, phone, is_active)
SELECT 'GANESH KUSHWAHA', '8982166401', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.technicians WHERE name = 'GANESH KUSHWAHA'
);

-- SURYA
UPDATE public.technicians
SET phone = '6263144696', is_active = true, updated_at = now()
WHERE name = 'SURYA';

INSERT INTO public.technicians (name, phone, is_active)
SELECT 'SURYA', '6263144696', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.technicians WHERE name = 'SURYA'
);

-- Deactivate any other technicians not in this set of four
UPDATE public.technicians
SET is_active = false, updated_at = now()
WHERE name NOT IN ('DURPAL SINGH KUSHRAM', 'ASHISH SONAKIYA', 'GANESH KUSHWAHA', 'SURYA');
