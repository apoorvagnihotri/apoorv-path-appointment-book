import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster"

const AdminLayout: React.FC = () => {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (!isAdmin) {
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
