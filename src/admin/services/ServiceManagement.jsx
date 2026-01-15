import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import {
  addService,
  getServices,
  updateService,
  deleteService,
} from "../../apiservice/service";
import serviceImg from "../../assets/images/images.jpg";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceName(data.name || "");
      setServiceDescription(data.description || "");
    } else {
      setServiceName("");
      setServiceDescription("");
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    setServiceName("");
    setServiceDescription("");
  };

  const handleSave = async () => {
    try {
      if (modal.type === "add") {
        await addService({
          name: serviceName,
          description: serviceDescription,
        });
      } else if (modal.type === "edit") {
        await updateService(modal.data._id, {
          name: serviceName,
          description: serviceDescription,
        });
      }
      fetchServices();
      closeModal();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteService(id);
      fetchServices();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold">Service Management</h2>
        <p className="text-gray-600">Manage all services</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-linear-to-r from-teal-500 to-emerald-500 text-emerald-100 px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add New
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            style={{ maxHeight: "250px" }}
          >
            <div className="w-full h-24 overflow-hidden">
              <img
                src={serviceImg}
                alt="Service"
                className="w-full object-cover h-full"
              />
            </div>

            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-md font-semibold mb-1 truncate">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {service.description}
              </p>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => openModal("edit", service)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 flex justify-center items-center mt-2 p-2 rounded-full transition"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 flex justify-center items-center mt-2 p-2 rounded-full transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add Service" : "Edit Service"}
            </h3>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
              placeholder="Service Name"
            />
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              placeholder="Description"
            />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceManagement;
