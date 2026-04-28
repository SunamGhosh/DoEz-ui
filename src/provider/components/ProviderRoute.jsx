import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProviderRoute = ({ children }) => {
  const { user, isAuthenticated, authChecked } = useSelector((state) => state.auth);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "provider") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProviderRoute;
