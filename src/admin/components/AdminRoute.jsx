import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../api';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data?.data?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div className="p-10">Checking auth...</div>;

  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
