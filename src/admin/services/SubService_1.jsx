import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import {
  addSubService1,
  getAllSubService1,
  updateSubService1,
  deleteSubService1,
} from "../../apiservice/subservice_1";

const SubService1 = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [subService1List, setSubService1List] = useState([]);

  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
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
    const ss1 = await getAllSubService1();

    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
    setSubService1List(ss1.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceId(data.serviceId?._id);
      setSubServiceId(data.subServiceId?._id);
      setName(data.name);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setServiceId("");
    setSubServiceId("");
    setName("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    resetForm();
  };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !name) {
      alert("All fields are required");
      return;
    }

    const payload = {
      serviceId,
      subServiceId,
      name,
    };

    if (modal.type === "add") {
      await addSubService1(payload);
    } else {
      await updateSubService1(modal.data._id, payload);
    }

    fetchAll();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteSubService1(id);
      fetchAll();
    }
  };

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Sub Service Level 1</h2>
        <p className="text-gray-600">Manage all sub service level 1</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-linear-to-r from-teal-500 to-emerald-500 text-emerald-100 px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add Sub Service 1
      </button>

      <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-100 p-4 font-semibold">
          <div className="font-bold">Sub Service 1</div>
          <div className="font-bold">Sub Service Name</div>
          <div className="font-bold">Service Name</div>
          <div className="text-center font-bold">Edit</div>
          <div className="text-center font-bold">Delete</div>
        </div>

        {subService1List.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-5 p-4 border-t border-gray-400 items-center"
          >
            <div>{item.name}</div>

            <div className="text-green-600">{item.subServiceId?.name}</div>

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
        {subService1List.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow border">
            <h4 className="font-bold text-lg mb-2">{item.name}</h4>

            <p className="text-sm">
              <span className="font-semibold">Service:</span>{" "}
              {item.serviceId?.name}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Sub Service:</span>{" "}
              {item.subServiceId?.name}
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
              {modal.type === "add" ? "Add" : "Edit"} Sub Service 1
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

            <select
              className="w-full border p-2 mb-3"
              value={subServiceId}
              onChange={(e) => setSubServiceId(e.target.value)}
            >
              <option value="">Select Sub Service</option>
              {subServices
                .filter((s) => s.serviceId?._id === serviceId)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <input
              type="text"
              className="w-full border p-2 mb-4"
              placeholder="Sub Service Level 1 Name"
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

export default SubService1;
