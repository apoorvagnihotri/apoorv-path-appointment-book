import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

export function useBookingAssignment() {
  const { token } = useParams<{ token: string }>();
  const [assignment, setAssignment] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedBy, setAssignedBy] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const fetchAssignmentDetails = useCallback(async () => {
    if (!token) {
      setError('Assignment token is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch assignment and related order details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('booking_assignments')
        .select(`
          *,
          orders:order_id (
            order_number,
            customer_name,
            total_amount,
            appointment_date,
            appointment_time
          )
        `)
        .eq('assignment_token', token)
        .single();

      if (assignmentError || !assignmentData) {
        throw new Error(assignmentError?.message || 'Assignment not found or already processed.');
      }
      
      if (assignmentData.status !== 'pending') {
        throw new Error('This booking has already been assigned.');
      }

      setAssignment(assignmentData);

      // Fetch active technicians
      const { data: techniciansData, error: techniciansError } = await supabase
        .from('technicians')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (techniciansError) {
        throw new Error(techniciansError.message);
      }

      setTechnicians(techniciansData || []);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechnician || !assignedBy) {
      setError('Please select a technician and enter your name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc('assign_technician_to_booking', {
        assignment_token_param: token,
        technician_id_param: selectedTechnician,
        assigned_by_param: assignedBy,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }
      
      setAssignmentSuccess(true);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    assignment,
    technicians,
    loading,
    error,
    assignedBy,
    setAssignedBy,
    selectedTechnician,
    setSelectedTechnician,
    isSubmitting,
    assignmentSuccess,
    handleAssignTechnician,
  };
}
