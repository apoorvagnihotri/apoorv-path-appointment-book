-- Remove complex email system and replace with simplified booking assignment system
-- This migration removes the complex email system and creates a simple technician assignment system

-- Drop complex email system first
DROP FUNCTION IF EXISTS public.get_emails_needing_escalation();
DROP FUNCTION IF EXISTS public.mark_email_as_verified(UUID);
DROP TRIGGER IF EXISTS update_email_notifications_updated_at ON public.email_notifications;
DROP TABLE IF EXISTS public.email_escalations CASCADE;
DROP TABLE IF EXISTS public.email_notifications CASCADE;

-- Create simplified system for technician assignment
CREATE TABLE public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking assignments table
CREATE TABLE public.booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.technicians(id),
  assignment_token UUID NOT NULL DEFAULT gen_random_uuid(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by TEXT, -- Name of person who assigned
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for technicians (accessible for assignment purposes)
CREATE POLICY "Technicians are viewable by authenticated users" ON public.technicians
  FOR SELECT 
  USING (true); -- For the assignment dropdown

CREATE POLICY "System can manage technicians" ON public.technicians
  FOR ALL
  USING (true); -- Admin operations

-- Create policies for booking assignments
CREATE POLICY "Booking assignments are viewable by authenticated users" ON public.booking_assignments
  FOR SELECT 
  USING (true); -- For dashboard

CREATE POLICY "System can create booking assignments" ON public.booking_assignments
  FOR INSERT 
  WITH CHECK (true); -- When bookings are created

CREATE POLICY "System can update booking assignments" ON public.booking_assignments
  FOR UPDATE 
  USING (true); -- When technicians are assigned

-- Add indexes for better performance
CREATE INDEX idx_booking_assignments_order_id ON public.booking_assignments(order_id);
CREATE INDEX idx_booking_assignments_technician_id ON public.booking_assignments(technician_id);
CREATE INDEX idx_booking_assignments_assignment_token ON public.booking_assignments(assignment_token);
CREATE INDEX idx_booking_assignments_status ON public.booking_assignments(status);
CREATE INDEX idx_booking_assignments_created_at ON public.booking_assignments(created_at);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_assignments_updated_at
  BEFORE UPDATE ON public.booking_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to assign a technician to a booking
CREATE OR REPLACE FUNCTION public.assign_technician_to_booking(
  assignment_token_param UUID,
  technician_id_param UUID,
  assigned_by_param TEXT
)
RETURNS boolean AS $$
DECLARE
  assignment_record booking_assignments%ROWTYPE;
BEGIN
  -- Find the assignment record
  SELECT * INTO assignment_record 
  FROM public.booking_assignments 
  WHERE assignment_token = assignment_token_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update the assignment
  UPDATE public.booking_assignments 
  SET 
    technician_id = technician_id_param,
    assigned_at = now(),
    assigned_by = assigned_by_param,
    status = 'assigned'
  WHERE assignment_token = assignment_token_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some default technicians
INSERT INTO public.technicians (name, email, is_active) VALUES
  ('Lab Technician 1', 'tech1@apoorvpathology.com', true),
  ('Lab Technician 2', 'tech2@apoorvpathology.com', true),
  ('Lab Technician 3', 'tech3@apoorvpathology.com', true),
  ('Field Collector 1', 'collector1@apoorvpathology.com', true),
  ('Field Collector 2', 'collector2@apoorvpathology.com', true);

-- Note: We're keeping the update_updated_at_column() function as it's used by other tables
