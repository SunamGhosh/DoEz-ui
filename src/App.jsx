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
import Login from "./pages/Login";

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
          }
        >
          {/* Default admin page */}
          <Route index element={<AdminDashboard />} />

          {/* Add more admin sub-routes here later */}
          {/* <Route path="users" element={<UsersList />} /> */}
          {/* <Route path="bookings" element={<BookingsList />} /> */}
           <Route path="services" element={<ServiceManagement />} />
           <Route path="sub-services" element={<SubService />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
