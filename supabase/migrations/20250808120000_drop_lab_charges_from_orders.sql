-- Drop lab_charges column from orders table
-- Reason: lab charges are no longer used in pricing or UI

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS lab_charges;
