-- Make test_id nullable in cart_items table
ALTER TABLE public.cart_items ALTER COLUMN test_id DROP NOT NULL;