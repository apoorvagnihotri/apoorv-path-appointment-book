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
    if (!user) return;

    setLoading(true);
    try {
      // First check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          email: currentUser.email || ''
        });
      } else {
        // Profile doesn't exist (user registered before trigger was created)
        // Create one from user metadata
        console.log('No profile found, creating initial profile for existing user');
        const newProfile = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || '',
          mobile_number: currentUser.user_metadata?.mobile_number || currentUser.phone || '',
        };

        try {
          const { data: savedProfile, error: saveError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (saveError) {
            console.error('Error creating profile for existing user:', saveError);
            throw saveError;
          }

          setProfile({
            ...savedProfile,
            email: currentUser.email || ''
          });
        } catch (createError) {
          console.error('Failed to create profile for existing user:', createError);
          throw createError;
        }
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
