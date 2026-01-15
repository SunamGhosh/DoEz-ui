import { useEffect, useState } from "react";
import { Edit, Trash2, UserCheck } from "lucide-react";
import {
  getAllProviders,
  addProvider,
  updateProvider,
  deleteProvider,
} from "../../apiservice/provider";

const AdminProvider = () => {
  const [providers, setProviders] = useState([]);
  const [modal, setModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({
    name: "",
    workArea: "",
    experienceYears: "",
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const res = await getAllProviders();
    setProviders(res.data.data || []);
  };

  const openModal = (data = null) => {
    setModal({ open: true, data });
    setForm(
      data || { name: "", workArea: "", experienceYears: "" }
    );
  };

  const closeModal = () => {
    setModal({ open: false, data: null });
    setForm({ name: "", workArea: "", experienceYears: "" });
  };

  const handleSave = async () => {
    if (modal.data) {
      await updateProvider(modal.data._id, form);
    } else {
      await addProvider(form);
    }
    closeModal();
    loadProviders();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this provider?")) {
      await deleteProvider(id);
      loadProviders();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <UserCheck /> Providers
        </h2>
        <p className="text-gray-600">Manage all service providers</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-6 bg-gray-100 p-4 font-semibold">
          <div>Name</div>
          <div>Work Area</div>
          <div>Experience</div>
          <div>Availability</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {providers.map((p) => (
          <div
            key={p._id}
            className="grid grid-cols-6 p-4 border-t items-center"
          >
            <div>{p.name}</div>
            <div className="text-blue-600">{p.workArea}</div>
            <div>{p.experienceYears || "-"}</div>
            <div className="text-green-600">{p.availability}</div>

            <div className="text-center">
              <button
                onClick={() => openModal(p)}
                className="bg-blue-100 text-blue-600 p-2 rounded"
              >
                <Edit size={16} />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-100 text-red-600 p-2 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {providers.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded-xl shadow border"
          >
            <h4 className="font-bold text-lg mb-2">{p.name}</h4>

            <p className="text-sm">
              <span className="font-semibold">Work Area:</span>{" "}
              {p.workArea}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Experience:</span>{" "}
              {p.experienceYears || "-"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Availability:</span>{" "}
              {p.availability}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openModal(p)}
                className="flex-1 bg-blue-100 text-blue-600 py-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(p._id)}
                className="flex-1 bg-red-100 text-red-600 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.data ? "Edit" : "Add"} Provider
            </h3>

            <input
              className="w-full border p-2 mb-3"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-3"
              placeholder="Work Area"
              value={form.workArea}
              onChange={(e) =>
                setForm({ ...form, workArea: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-4"
              placeholder="Experience Years"
              value={form.experienceYears}
              onChange={(e) =>
                setForm({
                  ...form,
                  experienceYears: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="border px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2"
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

export default AdminProvider;
