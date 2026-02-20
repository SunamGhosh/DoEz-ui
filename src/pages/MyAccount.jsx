import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Phone, Lock, LogOut, Globe, Moon, Sun, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { logout, checkAuth } from "../store/authSlice";
import { getUserProfile, updateUserProfile, changePassword, uploadProfileImage } from "../apiservice/user";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setProfile(res.data.data);
      setUpdateForm({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        phone: res.data.data.phone || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserProfile(updateForm);
      toast.success("Profile updated successfully");
      setIsUpdateModalOpen(false);
      fetchProfile();
      dispatch(checkAuth());
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      setLoading(true);
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setIsPasswordModalOpen(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      await uploadProfileImage(formData);
      toast.success("Profile picture updated");
      fetchProfile();
      dispatch(checkAuth());
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 border-teal-600 animate-spin mx-auto text-teal-600" />
            <p className="mt-4 text-gray-600 font-medium">Loading your account...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-gray-400 hover:text-teal-600 font-medium transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Account</h1>
              <p className="text-gray-500 text-xs font-medium">Hello, {profile?.name || "User"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-[80px] -mr-8 -mt-8 z-0"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* Profile Picture Section */}
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full border-2 border-white shadow-lg overflow-hidden bg-teal-50 flex items-center justify-center text-teal-600 ring-2 ring-teal-50/50">
                        {profile?.profileImage ? (
                          <img
                            src={getImageUrl(profile.profileImage)}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                          </span>
                        )}

                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -bottom-1 -right-1 bg-black hover:bg-teal-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>

                    <div className="text-center md:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">
                          {profile?.name || "-"}
                        </h2>
                        <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-bold uppercase tracking-wider self-center">
                          {profile?.role || "Customer"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm font-medium flex items-center justify-center md:justify-start gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5" />
                        {profile?.email || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 pt-8 border-t border-gray-50">
                    <DetailItem label="Full Name" value={profile?.name} icon={<User className="w-4 h-4 text-gray-400" />} />
                    <DetailItem label="Email Address" value={profile?.email} icon={<Mail className="w-4 h-4 text-gray-400" />} />
                    <DetailItem label="Phone Number" value={profile?.phone} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                    <DetailItem label="Account Type" value={profile?.role} icon={<Globe className="w-4 h-4 text-gray-400" />} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Settings Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">
                Account Settings
              </h3>

              <div className="space-y-3">
                <SettingsButton
                  label="Update Personal Details"
                  icon={<User className="w-4 h-4" />}
                  color="teal"
                  onClick={() => setIsUpdateModalOpen(true)}
                />
                <SettingsButton
                  label="Change Password"
                  icon={<Lock className="w-4 h-4" />}
                  color="blue"
                  onClick={() => setIsPasswordModalOpen(true)}
                />
                <SettingsButton
                  label="Change Language"
                  icon={<Globe className="w-4 h-4" />}
                  color="purple"
                />
                <SettingsButton
                  label="Appearance"
                  icon={<Moon className="w-4 h-4" />}
                  color="gray"
                  secondaryIcon={<Sun className="w-4 h-4 text-gray-400" />}
                />

                <div className="pt-4 mt-4 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Details Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Details"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={updateForm.name}
              onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={updateForm.email}
              onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={updateForm.phone}
              onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm text-gray-900"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

const DetailItem = ({ label, value, icon }) => (
  <div className="group flex items-start gap-3">
    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-teal-50 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">{value || "-"}</p>
    </div>
  </div>
);

const SettingsButton = ({ label, icon, color, onClick, secondaryIcon }) => {
  const colors = {
    teal: "bg-teal-50/50 text-teal-600 hover:bg-teal-50",
    blue: "bg-blue-50/50 text-blue-600 hover:bg-blue-50",
    purple: "bg-purple-50/50 text-purple-700 hover:bg-purple-50",
    gray: "bg-gray-50/50 text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between p-3 rounded-xl ${colors[color]} transition-all hover:translate-x-1 active:translate-x-0`}
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-lg group-hover:bg-white transition-colors shadow-sm">
          {icon}
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      {secondaryIcon && (
        <div className="p-1">
          {secondaryIcon}
        </div>
      )}
    </button>
  );
};

export default MyAccount;
