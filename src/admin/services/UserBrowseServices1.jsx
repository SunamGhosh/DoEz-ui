import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

import { getAllSubService1 } from "../../apiservice/subservice_1";
import { getAllSubService2 } from "../../apiservice/subservice_2";
import { getAllSubService3 } from "../../apiservice/subservice_3";

const BrowseSubService1 = () => {
  const navigate = useNavigate();
  const { subId } = useParams();

  const [sub1, setSub1] = useState([]);
  const [sub2, setSub2] = useState([]);
  const [sub3, setSub3] = useState([]);

  const [selectedSub1, setSelectedSub1] = useState(null);
  const [selectedSub2, setSelectedSub2] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ================= FETCH ALL DATA ONCE ================= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s1, s2, s3] = await Promise.all([
          getAllSubService1(),
          getAllSubService2(),
          getAllSubService3(),
        ]);

        const allSub1 = s1?.data?.data || [];
        const allSub2 = s2?.data?.data || [];
        const allSub3 = s3?.data?.data || [];

        const filteredSub1 = allSub1.filter(
          item => item.subServiceId?._id === subId
        );

        setSub1(filteredSub1);
        setSub2(allSub2);
        setSub3(allSub3);

        // Auto-select first category (Urban Company UX)
        if (filteredSub1.length > 0) {
          setSelectedSub1(filteredSub1[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [subId]);

  /* ================= FILTER LOGIC ================= */
  const filteredSub2 = selectedSub1
    ? sub2.filter(
        item => item.subService1Id?._id === selectedSub1._id
      )
    : [];

  const filteredSub3 = selectedSub2
    ? sub3.filter(
        item => item.subService2Id?._id === selectedSub2._id
      )
    : [];

  /* ================= BOOK HANDLER ================= */
  const handleBook = (id) => {
    navigate(`/bookservice/${id}`);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-teal-600 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 mt-24">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-12 gap-6">

          {/* LEFT PANEL — SubService1 */}
          <div className="col-span-12 md:col-span-3 bg-white rounded-xl shadow p-4">
            <h3 className="font-bold mb-4">Select a service</h3>

            {sub1.length === 0 && (
              <p className="text-sm text-gray-500">No categories found</p>
            )}

            {sub1.map(item => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedSub1(item);
                  setSelectedSub2(null);
                }}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition
                  ${
                    selectedSub1?._id === item._id
                      ? "bg-teal-100 text-teal-800 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
              >
                {item.name}
              </div>
            ))}
          </div>

          {/* RIGHT PANEL — SubService2 */}
          <div className="col-span-12 md:col-span-9 bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-6">
              {selectedSub1?.name || "Services"}
            </h3>

            {filteredSub2.length === 0 && (
              <p className="text-gray-500">No services available</p>
            )}

            {filteredSub2.map(item => (
              <div key={item._id} className="border-b py-4">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedSub2(
                        selectedSub2?._id === item._id ? null : item
                      )
                    }
                    className="border px-4 py-1 rounded-lg text-teal-600 hover:bg-teal-50"
                  >
                    {selectedSub2?._id === item._id ? "Hide" : "Add"}
                  </button>
                </div>

                {/* EXPAND — SubService3 */}
                {selectedSub2?._id === item._id && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    {filteredSub3.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No options available
                      </p>
                    )}

                    {filteredSub3.map(opt => (
                      <div
                        key={opt._id}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="font-medium">{opt.name}</p>
                          <p className="text-sm text-gray-500">
                            ₹{opt.price}
                          </p>
                        </div>

                        <button
                          onClick={() => handleBook(opt._id)}
                          className="bg-teal-600 text-white px-4 py-1 rounded-lg hover:bg-teal-700"
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default BrowseSubService1;
