import React from "react";
import { Outlet } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";

const ProviderLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <ProviderSidebar />
      <main className="flex-1 overflow-y-auto ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;
