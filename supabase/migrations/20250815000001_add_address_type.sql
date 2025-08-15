-- Add address_type column to addresses table and migrate existing data
ALTER TABLE public.addresses 
ADD COLUMN address_type TEXT DEFAULT 'Home';

-- Update existing addresses to have 'Home' as default address type
UPDATE public.addresses 
SET address_type = 'Home' 
WHERE address_type IS NULL;

-- Make address_type NOT NULL after setting defaults
ALTER TABLE public.addresses 
ALTER COLUMN address_type SET NOT NULL;

-- Add check constraint for valid address types
ALTER TABLE public.addresses 
ADD CONSTRAINT check_address_type 
CHECK (address_type IN ('Home', 'Office', 'Other'));