import React, { useState } from "react";
import { PlusCircle, Edit, Eye, Trash2, Layers } from "lucide-react";

const IconActionButton = ({ icon, color, onClick }) => {
  const colors = {
    green: "bg-sky-50 p-2 rounded-lg text-green-600 hover:text-green-700",
    indigo: "bg-indigo-50 p-2 rounded-lg text-indigo-600 hover:text-indigo-700",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center transition hover:scale-110 ${colors[color]}`}
    >
      {icon}
    </button>
  );
};

const serviceCards = [
  { key: "service", title: "Service" },
  { key: "sub_service", title: "Sub Service" },
  { key: "sub_service_1", title: "Sub Service 1" },
  { key: "sub_service_2", title: "Sub Service 2" },
  { key: "sub_service_3", title: "Sub Service 3" },
  { key: "sub_service_4", title: "Sub Service 4" },
];

const ServiceManagement = () => {
  const [modal, setModal] = useState({
    open: false,
    type: "",
    action: "",
    data: null,
  });

  const [services, setServices] = useState([
    { id: 1, name: "Cleaning", description: "House cleaning service" },
    { id: 2, name: "Repair", description: "All repair works" },
  ]);

  const openModal = (type, action, data = null) => {
    setModal({ open: true, type, action, data });
  };

  const closeModal = () => {
    setModal({ open: false, type: "", action: "", data: null });
  };

  const handleSave = () => {
    closeModal();
  };

  return (
    <>
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Service Management</h2>
        <p className="text-gray-600 mt-2">
          Manage all services and sub services
        </p>
      </div>

      {/* SERVICE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceCards.map((item) => (
          <div
            key={item.key}
            className="bg-white shadow-xl rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-50 p-2 rounded-xl">
                <Layers className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-2xl font-semibold">{item.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <IconActionButton
                icon={<PlusCircle />}
                color="green"
                onClick={() => openModal("add", item.title)}
              />

              <IconActionButton
                icon={<Eye />}
                color="indigo"
                onClick={() => openModal("view", item.title)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500"
            >
              ✕
            </button>

            {/* TITLE */}
            <h3 className="text-xl font-bold mb-4">
              {modal.type === "add" && `Add ${modal.action}`}
              {modal.type === "view" && `${modal.action} List`}
              {modal.type === "edit" && `Edit ${modal.action}`}
            </h3>

            {/* ADD FORM */}
            {modal.type === "add" && (
              <>
                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder={`Enter ${modal.action} name`}
                />
                <textarea
                  className="w-full border p-2 mb-4 rounded"
                  placeholder="Description"
                />
                <button
                  onClick={handleSave}
                  className="w-full bg-indigo-600 text-white py-2 rounded"
                >
                  Save
                </button>
              </>
            )}

            {/* VIEW LIST */}
            {modal.type === "view" && (
              <>
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border p-3 rounded mb-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          openModal("edit", modal.action, item)
                        }
                        className="text-blue-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* EDIT FORM */}
            {modal.type === "edit" && (
              <>
                <input
                  defaultValue={modal.data?.name}
                  className="w-full border p-2 mb-3 rounded"
                />
                <textarea
                  defaultValue={modal.data?.description}
                  className="w-full border p-2 mb-4 rounded"
                />
                <button
                  onClick={handleSave}
                  className="w-full bg-indigo-600 text-white py-2 rounded"
                >
                  Update
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceManagement;
