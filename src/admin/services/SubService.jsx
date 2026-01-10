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

  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: "",
    data: null,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const s = await getServices();
    const ss = await getSubServices();

    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceId(data.serviceId?._id);
      setName(data.name);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setServiceId("");
    setName("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    resetForm();
  };

  const handleSave = async () => {
    if (!serviceId || !name) {
      alert("All fields are required");
      return;
    }

    const payload = { serviceId, name };

    if (modal.type === "add") {
      await addSubService(payload);
    } else {
      await updateSubService(modal.data._id, payload);
    }

    fetchAll();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteSubService(id);
      fetchAll();
    }
  };

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Sub Service</h2>
        <p className="text-gray-600">Manage all sub services</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-linear-to-r from-teal-500 to-emerald-500 text-emerald-100 px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add Sub Service
      </button>

      <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-100 p-4 font-semibold">
          <div className="font-bold">Sub Service Name</div>
          <div className="font-bold">Service Name</div>
          <div className="text-center font-bold">Edit</div>
          <div className="text-center font-bold">Delete</div>
        </div>

        {subServices.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-4 p-4 border-t items-center"
          >
            <div className="font-medium">{item.name}</div>

            <div className="text-blue-600">{item.serviceId?.name}</div>

            <div className="text-center">
              <button
                onClick={() => openModal("edit", item)}
                className="bg-blue-100 text-blue-600 p-2 rounded"
              >
                <Edit size={16} />
              </button>
            </div>

            <div className="text-center">
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

      <div className="md:hidden space-y-4">
        {subServices.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow border">
            <h4 className="font-bold text-lg mb-2">{item.name}</h4>

            <p className="text-sm">
              <span className="font-semibold">Service:</span>{" "}
              {item.serviceId?.name}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openModal("edit", item)}
                className="flex-1 bg-blue-100 text-blue-600 py-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="flex-1 bg-red-100 text-red-600 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add" : "Edit"} Sub Service
            </h3>

            <select
              className="w-full border p-2 mb-3"
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
              className="w-full border p-2 mb-4"
              placeholder="Sub Service Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white"
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
