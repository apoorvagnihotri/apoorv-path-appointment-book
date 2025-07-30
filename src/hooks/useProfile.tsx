import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  full_name?: string | null;
  mobile_number?: string | null;
  email?: string;
  date_of_birth?: string | null;
  sex?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      console.log('No user found, skipping profile fetch');
      return;
    }

    console.log('Fetching profile for user:', user.id);
    setLoading(true);
    try {
      // First check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('Authenticated user found:', currentUser.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, create a basic one from user metadata
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          const newProfile = {
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || '',
            mobile_number: currentUser.user_metadata?.mobile_number || currentUser.phone || '',
            email: currentUser.email || '',
          };
          console.log('Creating new profile from user metadata:', newProfile);
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else if (data) {
        const profileData = {
          ...data,
          email: currentUser.email || ''
        };
        console.log('Setting profile data:', profileData);
        setProfile(profileData);
      } else {
        // Create initial profile if no data returned
        const newProfile = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || '',
          mobile_number: currentUser.user_metadata?.mobile_number || currentUser.phone || '',
          email: currentUser.email || '',
        };
        console.log('No profile data, creating from user metadata:', newProfile);
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: new Error('No user or profile found') };

    setLoading(true);
    try {
      // Ensure we have a current authenticated user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile({
        ...data,
        email: currentUser.email || ''
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    fetchProfile,
  };
};
