import React, { useState, useEffect } from "react";
import {
  getProviderEarnings,
  getProviderProfile,
  toggleAvailability,
} from "../../apiservice/provider";
import { DollarSign, CheckCircle, Wifi, X, WifiOff } from "lucide-react";

const ProviderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, profileRes] = await Promise.all([
          getProviderEarnings(),
          getProviderProfile(),
        ]);
        setStats(earningsRes.data.data);
        setProfile(profileRes.data.data);
      } catch (err) {
        setError("Could not fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleAvailability = async () => {
    const newStatus = profile.status === "online" ? "offline" : "online";
    try {
      const res = await toggleAvailability(newStatus);
      setProfile(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not update availability. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats || !profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>No data found. Please try refreshing the page.</p>
      </div>
    );
  }

  const dashboardStats = [
    {
      name: "Monthly Earnings",
      stat: `₹${stats.monthlyEarnings || 0}`,
      icon: DollarSign,
    },
    {
      name: "Completed Jobs",
      stat: stats.completedJobs || 0,
      icon: CheckCircle,
    },
    {
      name: "Availability",
      stat: profile.status,
      icon: profile.status === "online" ? Wifi : WifiOff,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {profile?.user?.name || profile?.name || "Provider"}!
      </h1>
      <p className="text-gray-600 mb-8">Here's a summary of your activity.</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow-lg rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className={`h-8 w-8 ${
                      item.name === "Availability" && item.stat === "online"
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {item.stat}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow-lg rounded-lg p-5 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <button
          onClick={handleToggleAvailability}
          className={`px-4 py-2 text-white rounded-lg shadow-md transition-colors duration-200 ${
            profile.status === "online"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {profile.status === "online" ? (
            <X className="h-5 w-5 inline-block mr-2" />
          ) : (
            <Wifi className="h-5 w-5 inline-block mr-2" />
          )}
          Go {profile.status === "online" ? "Offline" : "Online"}
        </button>
      </div>
    </div>
  );
};

export default ProviderDashboard;
