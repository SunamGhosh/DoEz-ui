import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getServices } from "../apiservice/service";
import { getSubServicesByServiceId } from "../apiservice/subservice";
import API from "../api";

const BookService = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getServices()
      .then((res) => {
        const servicesArray = res.data.data || res.data;
        const foundService = servicesArray.find((s) => s._id === id);
        setService(foundService);
      })
      .catch((err) => console.error(err));

    getSubServicesByServiceId(id)
      .then((res) => setSubServices(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center pt-40">Loading...</div>;
  if (!service)
    return <div className="text-center pt-40">Service not found</div>;

  return (
    <Layout>
      <div className="pt-20 bg-white min-h-screen">
        <section className="py-10 bg-gray-50 rounded-[3rem] mx-4 shadow-sm border border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <section className="bg-gray-100 py-2 mb-10 rounded-[6rem] mx-4 shadow-sm border border-gray-100">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-[2px_4px_4px_rgba(100,116,139,0.5)]">
                  {service.name}
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  Choose a sub-service, add your details, and book with confidence.
                </p>
              </div>
            </section>
            {subServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {subServices.map((sub) => (
                  <div
                    key={sub._id}
                    className="bg-white p-8 rounded-3xl text-center shadow hover:shadow-xl hover:-translate-y-2 transition cursor-pointer"
                  >
                    {sub.image ? (
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <span className="text-3xl font-black text-teal-600">
                          {sub.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-800">
                      {sub.name}
                    </h3>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No sub-services available
              </p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BookService;
