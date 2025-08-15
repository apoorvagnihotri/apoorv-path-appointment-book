-- Rollback migration: remove address_type column added previously
ALTER TABLE public.addresses 
DROP COLUMN IF EXISTS address_type;

-- If any check constraint existed (named check_address_type), drop it safely
ALTER TABLE public.addresses 
DROP CONSTRAINT IF EXISTS check_address_type;
