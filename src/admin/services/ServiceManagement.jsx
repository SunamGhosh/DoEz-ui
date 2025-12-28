import React, { useState } from "react";
import { PlusCircle, Edit, Eye, Trash2, Layers } from "lucide-react";

const IconActionButton = ({ icon, label, color, onClick }) => {
  const colors = {
    green: "bg-sky-50 p-2 rounded-lg text-green-600 hover:text-green-700",
    blue: "bg-blue-50 p-2 rounded-lg text-blue-600 hover:text-blue-700",
    indigo: "bg-indigo-50 p-2 rounded-lg text-indigo-600 hover:text-indigo-700",
    red: "bg-red-50 p-2 rounded-lg text-red-600 hover:text-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition hover:scale-110 ${colors[color]}`}
    >
      {icon}
      {label && <span className="text-xs mt-1">{label}</span>}
    </button>
  );
};

const serviceCards = [
  { title: "Service", key: "service" },
  { title: "Sub Service", key: "sub_service" },
  { title: "Sub Service 1", key: "sub_service_1" },
  { title: "Sub Service 2", key: "sub_service_2" },
  { title: "Sub Service 3", key: "sub_service_3" },
  { title: "Sub Service 4", key: "sub_service_4" },
];

const ServiceManagement = () => {
  const [modal, setModal] = useState({
    open: false,
    type: "",
    action: "",
  });

  const openModal = (type, action) => {
    setModal({ open: true, type, action });
  };

  const closeModal = () => {
    setModal({ open: false, type: "", action: "" });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Service Management</h2>
        <p className="text-gray-600 mt-2">
          Manage all services and sub services
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceCards.map((item) => (
          <div
            key={item.key}
            className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <Layers className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-4">
              <IconActionButton
                icon={<PlusCircle />}
                color="green"
                backgroundColor="green-100"
                onClick={() => openModal(item.title, "Add")}
              />

              <IconActionButton
                icon={<Edit />}
                color="blue"
                onClick={() => openModal(item.title, "Edit")}
              />

              <IconActionButton
                icon={<Eye />}
                color="indigo"
                onClick={() => openModal(item.title, "View")}
              />

              <IconActionButton
                icon={<Trash2 />}
                color="red"
                onClick={() => openModal(item.title, "Delete")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">

      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-dark-400 hover:text-gray-600"
      >
        <strong>✕</strong>
      </button>

      <h3 className="text-2xl font-bold mb-6">
        {modal.action} {modal.type}
      </h3>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder={`Enter ${modal.type} name`}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows="3"
            placeholder={`Enter ${modal.type} description`}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {modal.action}
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default ServiceManagement;
