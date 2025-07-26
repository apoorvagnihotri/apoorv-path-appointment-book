-- Add member_id and member_name columns to order_items table
ALTER TABLE public.order_items 
ADD COLUMN member_id TEXT,
ADD COLUMN member_name TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_member_id ON public.order_items(member_id);
