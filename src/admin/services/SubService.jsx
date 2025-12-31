import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getServices } from "../../apiservice/service";
import {
  addSubService,
  getSubServices,
  updateSubService,
  deleteSubService,
} from "../../apiservice/subservice";

const SubService = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  const [serviceId, setServiceId] = useState("");
  const [subServiceName, setSubServiceName] = useState("");

  useEffect(() => {
    fetchServices();
    fetchSubServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fetchSubServices = async () => {
    try {
      const res = await getSubServices();
      setSubServices(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subservices:", error);
    }
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceId(data.serviceId?._id || "");
      setSubServiceName(data.name || "");
    } else {
      setServiceId("");
      setSubServiceName("");
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    setServiceId("");
    setSubServiceName("");
  };

  const handleSave = async () => {
    if (!serviceId || !subServiceName) {
      alert("Service & Sub Service name required");
      return;
    }

    const payload = {
      serviceId,
      name: subServiceName,
    };

    try {
      if (modal.type === "add") {
        await addSubService(payload);
      } else {
        await updateSubService(modal.data._id, payload);
      }

      fetchSubServices();
      closeModal();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteSubService(id);
      fetchSubServices();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold">Sub Service Management</h2>
        <p className="text-gray-600">Manage all sub services</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add New
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {subServices.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mt-2">{item.name}</h3>

            <p className="text-xs mt-1 text-blue-600">
              Service: {item.serviceId?.name || "N/A"}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => openModal("edit", item)}
                className="bg-blue-100 text-blue-600 p-2 rounded"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-100 text-red-600 p-2 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add Sub Service" : "Edit Sub Service"}
            </h3>

            <select
              className="w-full border p-2 mb-3 rounded"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Sub Service Name"
              className="w-full border p-2 mb-4 rounded"
              value={subServiceName}
              onChange={(e) => setSubServiceName(e.target.value)}
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

export default SubService;
