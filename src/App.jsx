import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkAuth } from "./store/authSlice";

import Home from "./pages/Home";
import Layout from "./components/Layout";

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

import ProviderDashboard from "./provider/components/ProviderDashboard";
import ProviderLayout from "./provider/components/ProviderLayout";
import ProviderRoute from "./provider/components/ProviderRoute";
import ProviderBooking from "./provider/services/ProviderBooking";
import ProviderProfile from "./provider/services/ProviderProfile";
import Earnings from "./provider/services/Earnings";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        {/* Full Landing Page - No shared Layout (so hero + services show completely) */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/bookservice/:id" element={<BookService />} />

        {/* Future public pages that need navbar + footer can go here */}
        {/* Example:
        <Route element={<Layout />}>
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        */}

        {/* Admin Login - Separate full page */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Area */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
          {/* Default admin page */}
          <Route index element={<AdminDashboard />} />

          {/* Add more admin sub-routes here later */}
          {/* <Route path="users" element={<UsersList />} /> */}
          {/* <Route path="bookings" element={<BookingsList />} /> */}
          <Route path="services" element={<ServiceManagement />} />
          <Route path="sub-services" element={<SubService />} />
          <Route path="sub-services1" element={<SubService_1 />} />
          <Route path="sub-services2" element={<SubService_2 />} />
          <Route path="sub-services3" element={<SubService_3 />} />
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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
