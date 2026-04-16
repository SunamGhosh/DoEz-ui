import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../apiservice/admin";
import { Loader2, Search, User, Mail, Phone, Trash2, CheckCircle, XCircle, MapPin } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.data.success) setUsers(res.data.data);
    } catch { toast.error("Failed to fetch users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await deleteUser(id); toast.success("User deleted"); fetchUsers(); }
    catch { toast.error("Failed to delete user"); }
  };

  const filtered = users.filter((u) =>
    u.role === "customer" && (
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
    )
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} customers registered</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text" placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm w-full sm:w-60"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
                        {user.profileImage
                          ? <img src={getImageUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
                          : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{user._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-xs text-gray-600"><Mail className="w-3 h-3 text-gray-400" />{user.email}</p>
                      <p className="flex items-center gap-1.5 text-xs text-gray-600"><Phone className="w-3 h-3 text-gray-400" />{user.phone || "—"}</p>
                      {user.address && <p className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="w-3 h-3 text-gray-400 shrink-0" /><span className="truncate max-w-[180px]">{user.address}</span></p>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {user.isVerified
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle className="w-3.5 h-3.5" />Verified</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><XCircle className="w-3.5 h-3.5" />Unverified</span>}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(user._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
