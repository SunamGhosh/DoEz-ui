import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
// import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area */}
      <div className="flex-1 bg-linear-to-br from-cyan-50 to-emerald-50 pt-20">
        {/* <AdminSidebar /> */}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
