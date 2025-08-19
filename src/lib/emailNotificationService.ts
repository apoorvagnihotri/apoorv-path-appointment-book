import { supabase } from '@/integrations/supabase/client';

export interface EmailNotificationData {
  orderId: string;
  recipientEmail: string;
  emailType: 'booking_notification' | 'escalation';
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    totalAmount: number;
    appointmentDate?: string;
    appointmentTime?: string;
    collectionType: string;
    collectionAddress?: any;
    items: Array<{
      name: string;
      price: number;
      memberName?: string;
    }>;
  };
}

export interface EmailVerificationResult {
  success: boolean;
  verificationToken?: string;
  error?: string;
}

export class EmailNotificationService {
  private static readonly SUPABASE_EDGE_FUNCTION_URL = 'https://wvjcpyijakskshhfyrkv.supabase.co/functions/v1';

  /**
   * Send booking notification email
   */
  static async sendBookingNotification(data: EmailNotificationData): Promise<EmailVerificationResult> {
    try {
      // First, create the email notification record in the database
      const { data: notification, error: dbError } = await supabase
        .from('email_notifications')
        .insert({
          order_id: data.orderId,
          email_type: data.emailType,
          recipient_email: data.recipientEmail,
          subject: `New Booking Confirmation - Order #${data.orderDetails.orderNumber}`,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to create email notification record' };
      }

      // Create escalation record for booking notifications
      if (data.emailType === 'booking_notification') {
        const { error: escalationError } = await supabase
          .from('email_escalations')
          .insert({
            original_notification_id: notification.id,
            verification_timeout_hours: 2 // 2 hours before escalation
          });

        if (escalationError) {
          console.error('Escalation record error:', escalationError);
        }
      }

      // Call Supabase Edge Function to send email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          notificationId: notification.id,
          verificationToken: notification.verification_token,
          emailData: data
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        
        // Update notification status to failed
        await supabase
          .from('email_notifications')
          .update({ 
            status: 'failed',
            failed_reason: emailError.message || 'Unknown error'
          })
          .eq('id', notification.id);

        return { success: false, error: 'Failed to send email' };
      }

      // Update notification status to sent
      await supabase
        .from('email_notifications')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);

      return {
        success: true,
        verificationToken: notification.verification_token
      };

    } catch (error) {
      console.error('EmailNotificationService error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Verify email notification (called when user clicks verification link)
   */
  static async verifyEmail(verificationToken: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_email_as_verified', { token: verificationToken });

      if (error) {
        console.error('Email verification error:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('EmailNotificationService verify error:', error);
      return false;
    }
  }

  /**
   * Get emails that need escalation (for use in cron jobs or scheduled tasks)
   */
  static async getEmailsNeedingEscalation() {
    try {
      const { data, error } = await supabase
        .rpc('get_emails_needing_escalation');

      if (error) {
        console.error('Get escalation emails error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('EmailNotificationService escalation error:', error);
      return [];
    }
  }

  /**
   * Process escalations (send escalation emails)
   */
  static async processEscalations() {
    try {
      const emailsToEscalate = await this.getEmailsNeedingEscalation();
      
      for (const email of emailsToEscalate) {
        // Get original order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('id', email.order_id)
          .single();

        if (orderError || !order) {
          console.error('Error fetching order for escalation:', orderError);
          continue;
        }

        // Send escalation email to deepaagni@gmail.com
        const escalationData: EmailNotificationData = {
          orderId: email.order_id,
          recipientEmail: 'deepaagni@gmail.com',
          emailType: 'escalation',
          orderDetails: {
            orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
            customerName: order.customer_details?.name || 'Customer',
            customerEmail: order.customer_details?.email || '',
            customerPhone: order.customer_details?.phone,
            totalAmount: order.total_amount,
            appointmentDate: order.appointment_date,
            appointmentTime: order.appointment_time,
            collectionType: order.collection_type,
            collectionAddress: order.collection_address,
            items: order.order_items?.map((item: any) => ({
              name: item.item_name,
              price: item.item_price,
              memberName: item.member_name
            })) || []
          }
        };

        const result = await this.sendBookingNotification(escalationData);
        
        if (result.success) {
          // Mark original escalation as processed
          await supabase
            .from('email_escalations')
            .update({ escalated_at: new Date().toISOString() })
            .eq('original_notification_id', email.notification_id);
        }
      }
    } catch (error) {
      console.error('Process escalations error:', error);
    }
  }
}
