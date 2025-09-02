import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster"
import logger from '@/lib/logger';

const AdminLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
  logger.debug('AdminLayout - Profile data:', data);
  logger.debug('AdminLayout - Profile error:', error);
        
        setUserProfile(data);
      }
      setProfileLoading(false);
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  const isAdmin = userProfile?.role === 'admin';

  logger.debug('AdminLayout - User:', user);
  logger.debug('AdminLayout - User Profile:', userProfile);
  logger.debug('AdminLayout - Is Admin:', isAdmin);
  logger.debug('AdminLayout - Auth Loading:', authLoading);
  logger.debug('AdminLayout - Profile Loading:', profileLoading);

  if (authLoading || profileLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    logger.debug('AdminLayout - Redirecting to 404 because user is not admin');
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="admin-dashboard">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl">Admin Dashboard</h1>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default AdminLayout;
