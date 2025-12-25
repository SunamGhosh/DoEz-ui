
import React, { useEffect, useState } from 'react';
import API from '../../api';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    bookings: 0,
    reviews: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data?.success && res.data?.data?.role === 'admin') {
          setAdmin(res.data.data);
        } else {
          setAdmin(null);
        }
      } catch (err) {
        console.error('Failed to fetch admin info:', err);
        setAdmin(null);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdmin();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, bookingsRes, reviewsRes] = await Promise.all([
          API.get('/users'),
          API.get('/booking'),
          API.get('/reviews'),
        ]);

        const users = usersRes.data?.data || [];
        const bookings = bookingsRes.data?.data || [];
        const reviews = reviewsRes.data?.data || [];

        setStats({
          users: users.length,
          providers: users.filter(u => u.role === 'provider').length,
          bookings: bookings.length,
          reviews: reviews.length,
          pending: bookings.filter(b => b.status === 'pending').length,
        });
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadData();
  }, []);

  if (loadingAdmin || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-600">Access denied. Please log in as admin.</p>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {admin.name}</h2>
        <p className="text-lg text-gray-600 mt-2">{admin.email}</p>
      </div>

    
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        <StatCard title="Total Users" value={stats.users} color="indigo" />
        <StatCard title="Providers" value={stats.providers} color="teal" />
        <StatCard title="Bookings" value={stats.bookings} color="purple" />
        <StatCard title="Reviews" value={stats.reviews} color="orange" />
        <StatCard title="Pending Bookings" value={stats.pending} color="rose" />
      </div>
    </>
  );
};

const StatCard = ({ title, value, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-50',
    teal: 'text-teal-600 bg-teal-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    rose: 'text-rose-600 bg-rose-50',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className="text-gray-600 text-lg font-semibold">{title}</p>
    </div>
  );
};

export default AdminDashboard;