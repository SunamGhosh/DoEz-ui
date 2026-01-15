import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getServices } from "../../apiservice/service";
import { getSubServices } from "../../apiservice/subservice";
import { getAllSubService1 } from "../../apiservice/subservice_1";
import { getAllSubService2 } from "../../apiservice/subservice_2";
import {
  addSubService3,
  getAllSubService3,
  updateSubService3,
  deleteSubService3,
} from "../../apiservice/subservice_3";

const SubService3 = () => {
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [subService1List, setSubService1List] = useState([]);
  const [subService2List, setSubService2List] = useState([]);
  const [subService3List, setSubService3List] = useState([]);

  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
  const [subService1Id, setSubService1Id] = useState("");
  const [subService2Id, setSubService2Id] = useState("");
  const [subService3Name, setSubService3Name] = useState("");

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
    const ss2 = await getAllSubService2();
    const ss3 = await getAllSubService3();

    setServices(s.data.data || []);
    setSubServices(ss.data.data || []);
    setSubService1List(ss1.data.data || []);
    setSubService2List(ss2.data.data || []);
    setSubService3List(ss3.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setServiceId(data.serviceId?._id);
      setSubServiceId(data.subServiceId?._id);
      setSubService1Id(data.subService1Id?._id);
      setSubService2Id(data.subService2Id?._id);
      setSubService3Name(data.subService3Name);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setServiceId("");
    setSubServiceId("");
    setSubService1Id("");
    setSubService2Id("");
    setSubService3Name("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    resetForm();
  };

  const handleSave = async () => {
    if (!serviceId || !subServiceId || !subService1Id || !subService2Id || !subService3Name) {
      alert("All fields are required");
      return;
    }

    const payload = {
      serviceId,
      subServiceId,
      subService1Id,
      subService2Id,
      subService3Name,
    };

    if (modal.type === "add") {
      await addSubService3(payload);
    } else {
      await updateSubService3(modal.data._id, payload);
    }

    fetchAll();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteSubService3(id);
      fetchAll();
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-3xl font-bold">Sub Service Level 3</h2>
        <p className="text-gray-600">Manage all sub service level 3</p>
      </div>

      <button
        onClick={() => openModal("add")}
        className="mb-6 flex items-center gap-2 bg-linear-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded"
      >
        <PlusCircle size={18} /> Add Sub Service 3
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100 p-4 font-semibold">
          <div>Sub Service 3</div>
          <div>Sub Service 2</div>
          <div>Sub Service 1</div>
          <div>Sub Service</div>
          <div>Service</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {subService3List.map((item) => (
          <div key={item._id} className="grid grid-cols-7 p-4 border-t border-gray-400 items-center">
            <div>{item.subService3Name}</div>
            <div className="text-pink-600">{item.subService2Id?.name}</div>
            <div className="text-purple-600">{item.subService1Id?.name}</div>
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

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add" : "Edit"} Sub Service 3
            </h3>

            <select className="w-full border p-2 mb-3" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select className="w-full border p-2 mb-3" value={subServiceId} onChange={(e) => setSubServiceId(e.target.value)}>
              <option value="">Select Sub Service</option>
              {subServices.filter(s => s.serviceId?._id === serviceId).map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select className="w-full border p-2 mb-3" value={subService1Id} onChange={(e) => setSubService1Id(e.target.value)}>
              <option value="">Select Sub Service 1</option>
              {subService1List.filter(s => s.subServiceId?._id === subServiceId).map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select className="w-full border p-2 mb-3" value={subService2Id} onChange={(e) => setSubService2Id(e.target.value)}>
              <option value="">Select Sub Service 2</option>
              {subService2List.filter(s => s.subService1Id?._id === subService1Id).map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <input
              className="w-full border p-2 mb-4"
              placeholder="Sub Service 3 Name"
              value={subService3Name}
              onChange={(e) => setSubService3Name(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="border px-4 py-2">Cancel</button>
              <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubService3;
