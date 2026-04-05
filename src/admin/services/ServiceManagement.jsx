import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  addService,
  getServices,
  updateService,
  deleteService,
} from "../../apiservice/service";
import { getImageUrl } from "../../utils/imageUtils";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceImage, setServiceImage] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
    console.log("service", services);
  }, []);

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceName(data.name || "");
      setServiceDescription(data.description || "");
      setServicePrice(data.price || "");
      setServiceImage(null);
    } else {
      setServiceName("");
      setServiceDescription("");
      setServicePrice("");
      setServiceImage(null);
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    setServiceName("");
    setServiceDescription("");
    setServicePrice("");
    setServiceImage(null);
  };

  const handleSave = async () => {
    try {
      if (!serviceName || !serviceDescription || !servicePrice) {
        alert("All fields are required");
        return;
      }
      const formData = new FormData();
      formData.append("name", serviceName);
      formData.append("description", serviceDescription);
      formData.append("price", Number(servicePrice));

      if (serviceImage) {
        formData.append("image", serviceImage);
      }

      if (modal.type === "add") {
        await addService(formData);
      } else {
        await updateService(modal.data._id, formData);
      }

      fetchServices();
      closeModal();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteService(id);
    fetchServices();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold">Service Management</h2>
        <p className="text-gray-600">Manage all services</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add New
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
          >
            <div className="w-full h-28 overflow-hidden">
              {service.image ? (
                <img
                  src={getImageUrl(service.image)}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold truncate">{service.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                {service.description}
              </p>
              <p className="text-sm font-semibold text-indigo-600">
                ₹{service.price}
              </p>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => openModal("edit", service)}
                  className="bg-blue-100 text-blue-600 p-2 rounded-full"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="bg-red-100 text-red-600 p-2 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add Service" : "Edit Service"}
            </h3>

            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Service Name"
              className="w-full border p-2 mb-3 rounded"
            />

            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Description"
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              type="number"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              placeholder="Price"
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              type="file"
              onChange={(e) => setServiceImage(e.target.files[0])}
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
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
