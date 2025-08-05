-- Add collection address and member details to orders table
ALTER TABLE public.orders 
ADD COLUMN collection_address JSONB,
ADD COLUMN customer_details JSONB;

-- Add member details to order_items for historical records
ALTER TABLE public.order_items 
ADD COLUMN member_details JSONB;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_collection_type ON public.orders(collection_type);
CREATE INDEX IF NOT EXISTS idx_orders_collection_address ON public.orders USING GIN (collection_address);
