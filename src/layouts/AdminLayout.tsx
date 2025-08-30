import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster"

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
        
        console.log('AdminLayout - Profile data:', data);
        console.log('AdminLayout - Profile error:', error);
        
        setUserProfile(data);
      }
      setProfileLoading(false);
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  const isAdmin = userProfile?.role === 'admin';

  console.log('AdminLayout - User:', user);
  console.log('AdminLayout - User Profile:', userProfile);
  console.log('AdminLayout - Is Admin:', isAdmin);
  console.log('AdminLayout - Auth Loading:', authLoading);
  console.log('AdminLayout - Profile Loading:', profileLoading);

  if (authLoading || profileLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('AdminLayout - Redirecting to 404 because user is not admin');
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
