-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy for services to be publicly readable
CREATE POLICY "Services are publicly readable" 
ON public.services 
FOR SELECT 
USING (true);

-- Insert sample services
INSERT INTO public.services (name, description, price, icon_name) VALUES 
('Injection IM/IV', 'Intramuscular and Intravenous injection services', 150.00, 'Syringe'),
('BP Measurement', 'Blood pressure measurement and monitoring', 50.00, 'Heart'),
('BMI Calculation', 'Body Mass Index calculation and consultation', 100.00, 'Calculator'),
('ECG', 'Electrocardiogram test for heart health', 300.00, 'Activity');

-- Update cart_items table to support multiple item types
ALTER TABLE public.cart_items 
ADD COLUMN item_type TEXT DEFAULT 'test' CHECK (item_type IN ('test', 'package', 'service')),
ADD COLUMN package_id UUID,
ADD COLUMN service_id UUID;

-- Add constraint to ensure only one of test_id, package_id, or service_id is set
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_single_item_check 
CHECK (
  (test_id IS NOT NULL AND package_id IS NULL AND service_id IS NULL) OR
  (test_id IS NULL AND package_id IS NOT NULL AND service_id IS NULL) OR  
  (test_id IS NULL AND package_id IS NULL AND service_id IS NOT NULL)
);

-- Add trigger for services updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();