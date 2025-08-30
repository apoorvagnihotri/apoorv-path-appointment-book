import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

      // Base query
      let query = supabase
        .from('booking_assignments')
        .select(`
          id,
          status,
          assigned_at,
          assigned_by,
          notes,
          technician:technician_id ( name ),
          order:order_id (
            order_number,
            customer_name,
            appointment_date,
            appointment_time,
            total_amount
          )
        `)
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Apply search term
      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`, { referencedTable: 'orders' });
      }

      const { data: bookingsData, error: bookingsError } = await query;

      if (bookingsError) {
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
      }

      setBookings(bookingsData || []);

      // Fetch technicians for the assignment dropdown
      const { data: techniciansData, error: techniciansError } = await supabase
        .from('technicians')
        .select('id, name')
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

  const assignTechnician = async (assignmentId: string, technicianId: string, assignerName: string) => {
    try {
      const { error } = await supabase.rpc('assign_technician_to_booking_by_id', {
        p_assignment_id: assignmentId,
        p_technician_id: technicianId,
        p_assigned_by: assignerName,
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
