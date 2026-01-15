import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Menu, X } from "lucide-react";

const ProviderLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area with sidebar */}
      <div className="flex-1 flex bg-linear-to-br from-gray-100 to-gray-200 pt-20">
        <ProviderSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-between items-center p-4 bg-white shadow-md md:hidden">
            <h1 className="text-2xl font-bold">Provider Dashboard</h1>
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default ProviderLayout;
