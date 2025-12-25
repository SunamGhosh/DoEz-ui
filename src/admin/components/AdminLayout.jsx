import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex">
      {}
      <AdminSidebar />

      {}
      <main className="flex-1 bg-gray-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;