import React, { useEffect, useState } from 'react';
import API from '../../api';
import { getAllProviders } from '../../apiservice/provider';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [providersCount, setProvidersCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch admin info
        const resAdmin = await API.get('/auth/me');
        if (resAdmin.data?.success && resAdmin.data?.data?.role === 'admin') {
          setAdmin(resAdmin.data.data);
        } else {
          setAdmin(null);
          return;
        }

        // Providers count
        const resProviders = await getAllProviders();
        const providers = resProviders.data?.data || [];
        setProvidersCount(providers.length);

        // Users count
        const resUsers = await API.get('/users');
        const users = resUsers.data?.data || [];
        setUsersCount(users.length);

        // Bookings
        const resBookings = await API.get('/bookings');
        const bookings = resBookings.data?.data || [];
        setBookingsCount(bookings.length);
        setPendingBookingsCount(
          bookings.filter((b) => b.status === 'Pending').length
        );

        // Reviews
        const resReviews = await API.get('/reviews');
        const reviews = resReviews.data?.data || [];
        setReviewsCount(reviews.length);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
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
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {admin.name}</h2>
        <p className="text-lg text-gray-600 mt-2">{admin.email}</p>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        <StatCard title="Providers" value={providersCount} color="teal" />
        <StatCard title="Users" value={usersCount} color="indigo" />
        <StatCard title="Total Bookings" value={bookingsCount} color="purple" />
        <StatCard title="Pending Bookings" value={pendingBookingsCount} color="orange" />
        <StatCard title="Reviews" value={reviewsCount} color="rose" />
      </div>
    </div>
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
