import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/authSlice";
import { SocketProvider } from "./context/SocketContext";

import Home from "./pages/Home";
import Layout from "./components/Layout";
import AdminProvider from "./admin/components/AdminProvider";

import AdminLogin from "./admin/components/Adminlogin";
import AdminDashboard from "./admin/components/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";
import AdminRoute from "./admin/components/AdminRoute";
import ServiceManagement from "./admin/services/ServiceManagement";
import SubService from "./admin/services/SubService";
import SubService_1 from "./admin/services/SubService_1";
import SubService_2 from "./admin/services/SubService_2";
import SubService_3 from "./admin/services/SubService_3";
import Login from "./pages/Login";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import MyAccount from "./pages/MyAccount";
import MyBrowseServices from "./admin/services/UserBrowseServices";
import MyBrowseServices1 from "./admin/services/UserBrowseServices1";

import ProviderDashboard from "./provider/components/ProviderDashboard";
import ProviderLayout from "./provider/components/ProviderLayout";
import ProviderRoute from "./provider/components/ProviderRoute";
import ProviderBooking from "./provider/services/ProviderBooking";
import ProviderProfile from "./provider/services/ProviderProfile";
import Earnings from "./provider/services/Earnings";
import ProviderReviews from "./provider/services/ProviderReviews";
import ProviderNotifications from "./provider/services/ProviderNotifications";
import ProviderSettings from "./provider/services/PoviderSettings";
import NotificationSoundManager from "./components/NotificationSoundManager";
import AdminAdmin from "./admin/components/AdminAdmin";
import AdminCommissions from "./admin/components/AdminCommissions";
import AdminUsers from "./admin/components/AdminUsers";
import AdminBookings from "./admin/components/AdminBookings";
import AdminReviews from "./admin/components/AdminReviews";

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <SocketProvider userId={user?._id}>
      <Router>
        <NotificationSoundManager />
        <Routes>
          {/* Full Landing Page - No shared Layout (so hero + services show completely) */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/bookservice/:id" element={<BookService />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/services" element={<MyBrowseServices />} />
          <Route path="/sub-ser1/:subId" element={<MyBrowseServices1 />} />

          {/* Admin Login - Separate full page */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Area */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="adminadd" element={<AdminAdmin />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="provider" element={<AdminProvider />} />
            <Route path="commissions" element={<AdminCommissions />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="sub-services" element={<SubService />} />
            <Route path="sub-services1" element={<SubService_1 />} />
            <Route path="sub-services2" element={<SubService_2 />} />
            <Route path="sub-services3" element={<SubService_3 />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>

          {/* Protected Provider Area */}
          <Route
            path="/provider"
            element={
              <ProviderRoute>
                <ProviderLayout />
              </ProviderRoute>
            }
          >
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="bookings" element={<ProviderBooking />} />
            <Route path="profile" element={<ProviderProfile />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="reviews$ratings" element={<ProviderReviews />} />
            <Route path="notifications" element={<ProviderNotifications />} />
            <Route path="settings" element={<ProviderSettings />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
