import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Address {
  id?: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  street_address: string;
  city: string;
  pincode: string;
  landmark?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useAddresses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // If this is set as default, first unset all other addresses as default
      if (addressData.is_default) {
        await (supabase as any)
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error: saveError } = await (supabase as any)
        .from('addresses')
        .insert({
          ...addressData,
          user_id: user.id,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving address:', saveError);
        setError(saveError.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAddresses = async () => {
    if (!user) {
      setError('User not authenticated');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching addresses:', fetchError);
        setError(fetchError.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to fetch addresses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // If this is being set as default, first unset all other addresses as default
      if (updates.is_default) {
        await (supabase as any)
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { data, error: updateError } = await (supabase as any)
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating address:', updateError);
        setError(updateError.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await (supabase as any)
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting address:', deleteError);
        setError(deleteError.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    loading,
    error,
  };
};
