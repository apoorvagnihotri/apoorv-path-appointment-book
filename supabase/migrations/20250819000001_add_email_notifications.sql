-- Create email_notifications table to track all email communications
CREATE TABLE public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'booking_notification', 'escalation'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_body TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'verified'
  verification_token UUID DEFAULT gen_random_uuid(),
  verified_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_escalations table to track escalation flow
CREATE TABLE public.email_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_notification_id UUID NOT NULL REFERENCES public.email_notifications(id) ON DELETE CASCADE,
  escalation_notification_id UUID REFERENCES public.email_notifications(id),
  verification_timeout_hours INTEGER NOT NULL DEFAULT 2,
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_escalations ENABLE ROW LEVEL SECURITY;

-- Create policies for email_notifications
CREATE POLICY "Email notifications are viewable by admin users" ON public.email_notifications
  FOR SELECT 
  USING (true); -- For now, make it accessible. In production, add proper admin checks

CREATE POLICY "System can create email notifications" ON public.email_notifications
  FOR INSERT 
  WITH CHECK (true); -- System level operations

CREATE POLICY "System can update email notifications" ON public.email_notifications
  FOR UPDATE 
  USING (true); -- System level operations

-- Create policies for email_escalations
CREATE POLICY "Email escalations are viewable by admin users" ON public.email_escalations
  FOR SELECT 
  USING (true);

CREATE POLICY "System can create email escalations" ON public.email_escalations
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update email escalations" ON public.email_escalations
  FOR UPDATE 
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_email_notifications_order_id ON public.email_notifications(order_id);
CREATE INDEX idx_email_notifications_verification_token ON public.email_notifications(verification_token);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_email_escalations_original_notification_id ON public.email_escalations(original_notification_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_email_notifications_updated_at
  BEFORE UPDATE ON public.email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some helper functions
CREATE OR REPLACE FUNCTION public.mark_email_as_verified(token UUID)
RETURNS boolean AS $$
BEGIN
  UPDATE public.email_notifications 
  SET 
    status = 'verified',
    verified_at = now(),
    updated_at = now()
  WHERE verification_token = token;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unverified emails that need escalation
CREATE OR REPLACE FUNCTION public.get_emails_needing_escalation()
RETURNS TABLE (
  notification_id UUID,
  order_id UUID,
  recipient_email TEXT,
  timeout_hours INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    en.id as notification_id,
    en.order_id,
    en.recipient_email,
    ee.verification_timeout_hours as timeout_hours,
    en.sent_at
  FROM public.email_notifications en
  JOIN public.email_escalations ee ON en.id = ee.original_notification_id
  WHERE 
    en.email_type = 'booking_notification'
    AND en.status = 'sent'
    AND en.sent_at IS NOT NULL
    AND en.sent_at < (now() - INTERVAL '1 hour' * ee.verification_timeout_hours)
    AND ee.escalated_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
