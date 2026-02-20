import { useEffect, useState } from "react";
import { PlusCircle, Edit } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api";

const AdminAdmin = () => {
  const [admins, setAdmins] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: "",
    data: null,
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await API.get("/admin/admins");
    setAdmins(res.data.data || []);
  };

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });

    if (data) {
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
      setPassword("");
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "", data: null });
    resetForm();
  };

  const handleSave = async () => {
    if (!name || !email || !phone || (modal.type === "add" && !password)) {
      alert("All fields are required");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      role: "admin",
      ...(password && { password }),
    };

    if (modal.type === "add") {
      await API.post("/admin/admins", payload);
    } else {
      await API.put(`/admin/admins/${modal.data._id}`, payload);
    }

    fetchAdmins();
    closeModal();
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const action = currentStatus === "suspended" ? "activate" : "suspend";
    if (window.confirm(`Are you sure you want to ${action} this admin?`)) {
      try {
        await API.patch(`/admin/admins/status/${id}`);
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins();
      } catch (error) {
        toast.error("Failed to update status");
      }
    }
  };

  return (
    <>
      {/* HEADER */}
      {/* HEADER */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side: Title */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Admins</h2>
            <p className="text-gray-600">Manage system administrators</p>
          </div>

          {/* Right side: Button */}
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> Add Admin
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-100 p-4 font-semibold">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Status</div>
        </div>

        {admins.map((a) => (
          <div
            key={a._id}
            className={`grid grid-cols-5 p-4 border-t border-gray-300 items-center ${a.status === 'suspended' ? 'bg-red-50/50' : ''}`}
          >
            <div className="flex items-center gap-2">
              {a.name}
              {a.status === 'suspended' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Suspended</span>
              )}
            </div>
            <div className="text-blue-600">{a.email}</div>
            <div>{a.phone}</div>

            <div className="text-center">
              <button
                onClick={() => openModal("edit", a)}
                className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition-colors"
                title="Edit Admin"
              >
                <Edit size={16} />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => handleStatusToggle(a._id, a.status)}
                className={`px-4 py-1.5 rounded-lg transition-all font-bold text-xs active:scale-95 ${a.status === "suspended"
                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                  : "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                  }`}
                title={a.status === "suspended" ? "Unsuspend Admin" : "Suspend Admin"}
              >
                {a.status === "suspended" ? "Activate" : "Suspend"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {admins.map((a) => (
          <div key={a._id} className={`p-4 rounded-xl shadow border ${a.status === 'suspended' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-lg">{a.name}</h4>
              {a.status === 'suspended' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Suspended</span>
              )}
            </div>

            <p className="text-sm">
              <span className="font-semibold">Email:</span> {a.email}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Phone:</span> {a.phone}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openModal("edit", a)}
                className="flex-1 bg-blue-100 text-blue-600 py-2 rounded font-bold text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => handleStatusToggle(a._id, a.status)}
                className={`flex-1 py-2 rounded font-bold text-sm ${a.status === "suspended"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                {a.status === "suspended" ? "Activate" : "Suspend"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modal.type === "add" ? "Add Admin" : "Edit Admin"}
            </h3>

            <input
              className="w-full border p-2 mb-3"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full border p-2 mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full border p-2 mb-3"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {modal.type === "add" && (
              <input
                type="password"
                className="w-full border p-2 mb-4"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

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

export default AdminAdmin;
