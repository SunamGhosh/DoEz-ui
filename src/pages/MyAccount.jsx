import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import Layout from "../components/Layout";
import API from "../api";

function MyAccount({ user, loading }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
      fetchCustomers();
    }, []);
  
    const fetchCustomers = async () => {
      const res = await API.get("/customer/customers");
      setCustomers(res.data.data || []);
    };


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          {/* <div> */}
          <h1 className="text-3xl font-black text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Hello, {user?.name || "User"}</p>
          {/* </div> */}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 relative">
              {/* Camera Button */}
             <div>
                 <h2 className="absolute top-4 right-4 text-xl font-bold">Role : Customer</h2>
              <button className="absolute bg-black hover:bg-teal-700 text-white p-2 rounded-full shadow-md transition">
                <Camera className="w-4 h-4" />
              </button>
             </div>

              {/* Profile Section */}
              <div className="flex items-center gap-6 border-b border-gray-300 pb-6">
                <div className="h-24 w-24 rounded-full bg-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user?.name || "-"}
                  </h2>
                  <p className="text-gray-500">{user?.accountType || "-"}</p>
                </div>
              </div>

              {/* Personal Details */}
              {customers.map((a) => (
              <div key={a._id} className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                <h2>{a.name}</h2>
                {/* <Detail label="Email" value={user?.email} />
                <Detail label="Phone" value={user?.phone} />
                <Detail label="Gender" value={user?.gender} />
                <Detail label="Date of Birth" value={user?.dob} />
                <Detail label="Address" value={user?.address} /> */}
              </div>
               ))}
            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Account Settings
              </h3>

              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition font-semibold">
                  Update Personal Details
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-semibold">
                  Change Password
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-semibold">
                  Change Language
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-semibold">
                  Light / Dark Mode
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-gray-900">{value || "-"}</p>
  </div>
);

export default MyAccount;
