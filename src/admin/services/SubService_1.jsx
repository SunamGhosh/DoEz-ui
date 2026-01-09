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
  const [subService1Name, setSubService1Name] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: "",
    data: null,
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchServices();
    fetchSubServices();
    fetchSubService1();
  }, []);

  const fetchServices = async () => {
    const res = await getServices();
    setServices(res.data.data || []);
  };

  const fetchSubServices = async () => {
    const res = await getSubServices();
    setSubServices(res.data.data || []);
  };

  const fetchSubService1 = async () => {
    const res = await getAllSubService1();
    setSubService1List(res.data.data || []);
  };

  /* ================= HANDLERS ================= */

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceId(data.serviceId?._id);
      setSubServiceId(data.subServiceId?._id);
      setSubService1Name(data.name);
    } else {
      setServiceId("");
      setSubServiceId("");
      setSubService1Name("");
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    setServiceId("");
    setSubServiceId("");
    setSubService1Name("");
  };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !subService1Name) {
      alert("All fields are required");
      return;
    }

    const payload = {
      serviceId,
      subServiceId,
      name: subService1Name,
    };

    if (modal.type === "add") {
      await addSubService1(payload);
    } else {
      await updateSubService1(modal.data._id, payload);
    }

    fetchSubService1();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteSubService1(id);
      fetchSubService1();
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-3xl font-bold">Sub Service Level 1</h2>
          <p className="text-gray-600">Manage all sub services1</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add Sub Service
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {subService1List.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{item.name}</h3>

            <p className="text-sm text-green-600">
              Sub Service: {item.subServiceId?.name}
            </p>

            <p className="text-sm text-blue-600">
              Service: {item.serviceId?.name}
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
              value={subService1Name}
              onChange={(e) => setSubService1Name(e.target.value)}
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
