import React, { useState } from "react";

function ProviderSettings() {
  const [language, setLanguage] = useState("English");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoAcceptBookings: false,
    vacationMode: false,
    showProfile: true,
    showPhone: false,
  });

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    console.log("Saved Settings:", settings);
    alert("Settings Saved Successfully!");
  };

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
          checked ? "translate-x-6" : ""
        }`}
      ></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Provider Settings
      </h2>

      {/* Account Settings */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">
          Account Settings
        </h3>

        <div className="grid md:grid-cols-3 gap-4 items-end">
          {/* Change Language */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Change Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Bengali</option>
              <option>Spanish</option>
            </select>
          </div>

          {/* Change Password */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition h-10"
          >
            Change Password
          </button>

          {/* Update Email */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition h-10"
          >
            Update Email
          </button>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Change Password</h3>

                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Update Email</h3>

                <input
                  type="email"
                  placeholder="New Email Address"
                  className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Notification Settings
        </h3>

        <div className="space-y-4">
          <SettingRow
            label="Email Notifications"
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
            Toggle={Toggle}
          />
          <SettingRow
            label="SMS Notifications"
            checked={settings.smsNotifications}
            onChange={() => handleToggle("smsNotifications")}
            Toggle={Toggle}
          />
        </div>
      </div>

      {/* Booking Settings */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Booking Settings
        </h3>

        <div className="space-y-4">
          <SettingRow
            label="Auto Accept Bookings"
            checked={settings.autoAcceptBookings}
            onChange={() => handleToggle("autoAcceptBookings")}
            Toggle={Toggle}
          />
          <SettingRow
            label="Vacation Mode"
            checked={settings.vacationMode}
            onChange={() => handleToggle("vacationMode")}
            Toggle={Toggle}
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Privacy Settings
        </h3>

        <div className="space-y-4">
          <SettingRow
            label="Show Profile Publicly"
            checked={settings.showProfile}
            onChange={() => handleToggle("showProfile")}
            Toggle={Toggle}
          />
          <SettingRow
            label="Show Phone Number"
            checked={settings.showPhone}
            onChange={() => handleToggle("showPhone")}
            Toggle={Toggle}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h3>

        <div className="flex gap-4 flex-wrap">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition">
            Deactivate Account
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold transition"
      >
        Save Changes
      </button>
    </div>
  );
}

const SettingRow = ({ label, checked, onChange, Toggle }) => (
  <div className="flex justify-between items-center border-b pb-3">
    <span className="text-gray-600 font-medium">{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default ProviderSettings;
