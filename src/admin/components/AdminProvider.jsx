import { useEffect, useState } from "react";
import { Edit, Trash2, UserCheck, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import {
  getAllProviders,
  addProvider,
  updateProvider,
  deleteProvider,
  approveProviderKyc,
} from "../../apiservice/provider";

const AdminProvider = () => {
  const [providers, setProviders] = useState([]);
  const [modal, setModal] = useState({ open: false, data: null });
  const [kycModal, setKycModal] = useState({ open: false, provider: null });
  const [form, setForm] = useState({
    name: "",
    workArea: "",
    experienceYears: "",
  });

  // Backend URL for image paths
  const BACKEND_URL = "http://localhost:5000";

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's already a full URL (Cloudinary), return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // Otherwise, it's a local path, prefix with backend URL
    return `${BACKEND_URL}${imageUrl}`;
  };

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

  const openKycModal = (provider) => {
    setKycModal({ open: true, provider });
  };

  const closeKycModal = () => {
    setKycModal({ open: false, provider: null });
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

  const handleKycApproval = async (id, status) => {
    try {
      await approveProviderKyc(id, status);
      loadProviders();
    } catch (err) {
      alert("Failed to update KYC status");
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
        <div className="grid grid-cols-7 bg-gray-100 p-4 font-semibold">
          <div>Name</div>
          <div>Work Area</div>
          <div>Experience</div>
          <div>Availability</div>
          <div>KYC Status</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {providers.map((p) => (
          <div
            key={p._id}
            className="grid grid-cols-7 p-4 border-t items-center"
          >
            <div>{p.name}</div>
            <div className="text-blue-600">{p.workArea}</div>
            <div>{p.experienceYears || "-"}</div>
            <div className="text-green-600">{p.availability}</div>

            <div>
              {p.kycStatus === "approved" ? (
                <div className="flex gap-1 flex-wrap items-center">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 size={16} /> Approved
                  </span>
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1"
                    title="View KYC Details"
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              ) : p.kycStatus === "rejected" ? (
                <div className="flex gap-1 flex-wrap items-center">
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle size={16} /> Rejected
                  </span>
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1"
                    title="View KYC Details"
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              ) : p.kycStatus === "pending" ? (
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1"
                    title="View KYC Details"
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    onClick={() => handleKycApproval(p._id, "approved")}
                    className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs"
                    title="Approve KYC"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleKycApproval(p._id, "rejected")}
                    className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs"
                    title="Reject KYC"
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={16} /> Not Submitted
                </span>
              )}
            </div>

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

            <div className="mt-2">
              <span className="font-semibold text-sm">KYC Status: </span>
              {p.kycStatus === "approved" ? (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 size={14} /> Approved
                  </span>
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View KYC Details
                  </button>
                </div>
              ) : p.kycStatus === "rejected" ? (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                    <XCircle size={14} /> Rejected
                  </span>
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View KYC Details
                  </button>
                </div>
              ) : p.kycStatus === "pending" ? (
                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={() => openKycModal(p)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View KYC Details
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleKycApproval(p._id, "approved")}
                      className="flex-1 bg-green-100 text-green-600 px-3 py-1 rounded text-sm"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleKycApproval(p._id, "rejected")}
                      className="flex-1 bg-red-100 text-red-600 px-3 py-1 rounded text-sm"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                  <Clock size={14} /> Not Submitted
                </span>
              )}
            </div>

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

      {/* Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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

      {/* KYC Details View Modal */}
      {kycModal.open && kycModal.provider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">KYC Details</h3>
                  <p className="text-indigo-100 mt-1">{kycModal.provider.name}</p>
                </div>
                <button
                  onClick={closeKycModal}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Provider Basic Info */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Provider Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900 font-medium">{kycModal.provider.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{kycModal.provider.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900 font-medium">{kycModal.provider.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Work Area</label>
                    <p className="text-gray-900 font-medium">{kycModal.provider.workArea || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Experience</label>
                    <p className="text-gray-900 font-medium">{kycModal.provider.experienceYears || "N/A"} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Availability</label>
                    <p className="text-gray-900 font-medium capitalize">{kycModal.provider.availability || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Aadhar Details */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Aadhar Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Aadhar Number</label>
                    <p className="text-gray-900 font-mono text-lg bg-gray-50 p-3 rounded-lg">
                      {kycModal.provider.aadharNumber || "Not Provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Aadhar Document</label>
                    {kycModal.provider.aadharFile ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(kycModal.provider.aadharFile)}
                          alt="Aadhar Card"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors"
                          onClick={() => window.open(getImageUrl(kycModal.provider.aadharFile), '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <p>No Image Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PAN Details */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  PAN Card Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">PAN Number</label>
                    <p className="text-gray-900 font-mono text-lg bg-gray-50 p-3 rounded-lg uppercase">
                      {kycModal.provider.panNumber || "Not Provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">PAN Card Document</label>
                    {kycModal.provider.panFile ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(kycModal.provider.panFile)}
                          alt="PAN Card"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors"
                          onClick={() => window.open(getImageUrl(kycModal.provider.panFile), '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <p>No Image Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  Bank Account Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Account Number</label>
                    <p className="text-gray-900 font-mono text-lg bg-gray-50 p-3 rounded-lg">
                      {kycModal.provider.bankDetails?.accountNumber || "Not Provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">IFSC Code</label>
                    <p className="text-gray-900 font-mono text-lg bg-gray-50 p-3 rounded-lg uppercase">
                      {kycModal.provider.bankDetails?.ifscCode || "Not Provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Bank Passbook/Cancelled Cheque</label>
                    {kycModal.provider.bankDetails?.passbookImage ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(kycModal.provider.bankDetails.passbookImage)}
                          alt="Passbook"
                          className="w-full max-h-60 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50"
                          onClick={() => window.open(getImageUrl(kycModal.provider.bankDetails.passbookImage), '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <p>No Image Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="bg-gray-50 p-6 rounded-b-xl border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                KYC Status: <span className="font-semibold text-yellow-600">Pending Review</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleKycApproval(kycModal.provider._id, "rejected");
                    closeKycModal();
                  }}
                  className="bg-red-100 text-red-700 px-6 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Reject KYC
                </button>
                <button
                  onClick={() => {
                    handleKycApproval(kycModal.provider._id, "approved");
                    closeKycModal();
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Approve KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProvider;
