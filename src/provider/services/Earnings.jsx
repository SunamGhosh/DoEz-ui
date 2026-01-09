import React, { useState, useEffect } from "react";
import {
  getProviderEarnings,
  getProviderProfile,
} from "../../apiservice/provider";
import { DollarSign, BarChart, ClipboardList } from "lucide-react";

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const [earningsRes, profileRes] = await Promise.all([
          getProviderEarnings(),
          getProviderProfile(),
        ]);

        setEarnings(earningsRes.data.data);
        setProfile(profileRes.data.data);
      } catch (err) {
        setError("Could not fetch earnings data");
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
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

  if (!earnings || !profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>No earnings data found. Please try refreshing the page.</p>
      </div>
    );
  }

  const earningsData = [
    {
      name: "Total Earnings",
      value: `₹${profile.totalEarnings || 0}`,
      icon: DollarSign,
    },
    {
      name: "Monthly Earnings",
      value: `₹${earnings.monthlyEarnings || 0}`,
      icon: DollarSign,
    },
    {
      name: "Completed Jobs",
      value: earnings.completedJobs || 0,
      icon: ClipboardList,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Earnings</h1>
      <p className="text-gray-600 mb-8">
        Track your earnings and job statistics.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {earningsData.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow-lg rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className="h-8 w-8 text-gray-400"
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
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow-lg rounded-lg p-5 transform transition-all duration-300 ease-in-out hover:shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart className="h-6 w-6 mr-2 text-cyan-700" />
          Earnings Chart
        </h3>
        <div className="text-center text-gray-500">
          [Chart will be implemented here]
        </div>
      </div>
    </div>
  );
};

export default Earnings;
