import React from 'react';
import { Navigate } from 'react-router-dom';

const ProviderRoute = ({ children }) => {
  const isProvider = true; 
  const loading = false;

  if (loading) {
    return <div>Loading...</div>;
  }

  return isProvider ? children : <Navigate to="/provider/login" />;
};

export default ProviderRoute;
