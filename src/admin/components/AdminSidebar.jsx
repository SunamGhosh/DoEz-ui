
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  CalendarCheck,
  Star,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Closed by default on mobile
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Providers', icon: Wrench, path: '/admin/providers' },
    { name: 'Services', icon: LayoutDashboard, path: '/admin/services' },
    { name: 'Sub Services', icon: LayoutDashboard, path: '/admin/sub-services' },
    { name: 'Bookings', icon: CalendarCheck, path: '/admin/bookings' },
    { name: 'Reviews', icon: Star, path: '/admin/reviews' },
  ];

  const handleLogout = () => {
    // Clear auth (adjust based on how you store token)
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear(); // or remove specific items
    navigate('/admin-login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-center h-16 bg-indigo-700 shadow-lg">
          <h1 className="text-2xl font-bold">Fixerly Admin</h1>
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close sidebar on mobile after click
                className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-10 text-gray-300 hover:bg-red-900/50 hover:text-white rounded-lg transition-all"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default AdminSidebar;