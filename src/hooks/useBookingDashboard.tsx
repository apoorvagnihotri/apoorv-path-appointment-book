import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export type BookingStatus = 'all' | 'pending' | 'assigned' | 'completed';

export function useBookingDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the timestamp for 48 hours ago
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      // Base query: fetch assignments without nested order join to avoid REST/select encoding issues
      let query = supabase
        .from('booking_assignments')
        .select('id,status,assigned_at,assigned_by,notes,technician:technician_id(name),order_id,assignment_token')
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: bookingsData, error: bookingsError } = await query;

      if (bookingsError) {
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
      }

      // bookingsData are assignments; fetch their orders in a second query and merge as order_info
      const assignments = bookingsData || [];
      const orderIds = Array.from(new Set(assignments.map((a: any) => a.order_id).filter(Boolean)));

      let ordersMap: Record<string, any> = {};
      if (orderIds.length > 0) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id,order_number,customer_details,appointment_date,appointment_time,total_amount')
          .in('id', orderIds as any[]);

        if (ordersError) {
          console.warn('Failed to fetch related orders:', ordersError);
        } else if (Array.isArray(ordersData)) {
          ordersMap = ordersData.reduce((acc: Record<string, any>, o: any) => {
            // Normalize a customer_name for easy display/search
            const normalized = {
              ...o,
              customer_name: o.customer_name ?? o.customer_details?.name ?? '',
            };
            acc[o.id] = normalized;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      const assignmentsWithOrders = assignments.map((a: any) => ({
        ...a,
        order_info: a.order_id ? ordersMap[a.order_id] ?? null : null,
      }));

      // Apply client-side search on order_info
      if (searchTerm && Array.isArray(assignmentsWithOrders)) {
        const term = searchTerm.toLowerCase();
        const filtered = assignmentsWithOrders.filter((b: any) => {
          const orderNumber = (b?.order_info?.order_number ?? '').toString().toLowerCase();
          const customerName = (
            b?.order_info?.customer_name ?? b?.order_info?.customer_details?.name ?? ''
          ).toString().toLowerCase();
          return orderNumber.includes(term) || customerName.includes(term);
        });
        setBookings(filtered);
      } else {
        setBookings(assignmentsWithOrders);
      }

      // Fetch technicians for the assignment dropdown
      const { data: techniciansData, error: techniciansError } = await supabase
        .from('technicians')
        .select('id, name, phone')
        .eq('is_active', true)
        .order('name');
      
      if (techniciansError) {
        throw new Error(`Failed to fetch technicians: ${techniciansError.message}`);
      }

      setTechnicians(techniciansData || []);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const assignTechnician = async (assignmentToken: string, technicianId: string) => {
    try {
      const { error } = await supabase.rpc('assign_technician_to_booking', {
    assignment_token_param: assignmentToken,
        technician_id_param: technicianId,
    assigned_by_param: null,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh data after assignment
      fetchDashboardData();
      return { success: true };
    } catch (e: any) {
  return { success: false, error: e.message };
    }
  };
  
  const completeAssignment = async (assignmentId: string) => {
    try {
        const { error } = await supabase
            .from('booking_assignments')
            .update({ status: 'completed', notes: 'Completed via dashboard' })
            .eq('id', assignmentId);

        if (error) throw error;

        fetchDashboardData(); // Refresh data
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
  };


  return {
    bookings,
    technicians,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    assignTechnician,
    completeAssignment,
    refreshData: fetchDashboardData,
  };
}
