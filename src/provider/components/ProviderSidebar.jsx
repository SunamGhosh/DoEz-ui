import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Book, User, DollarSign } from 'lucide-react';

const ProviderSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navLinks = [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/provider/bookings', label: 'Bookings', icon: Book },
    { to: '/provider/profile', label: 'Profile', icon: User },
    { to: '/provider/earnings', label: 'Earnings', icon: DollarSign },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-30 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-4 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40 md:hidden`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Provider</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to} className="mb-4">
                <Link
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900 text-white">
              <h2 className="text-2xl font-bold">Provider</h2>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800">
              <nav className="flex-1 px-2 py-4">
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.to} className="mb-2">
                      <Link
                        to={link.to}
                        className={`flex items-center p-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                          location.pathname === link.to
                            ? 'bg-gray-900 text-white shadow-inner'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white transform hover:scale-105'
                        }`}
                      >
                        <link.icon className="h-5 w-5 mr-3" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderSidebar;
