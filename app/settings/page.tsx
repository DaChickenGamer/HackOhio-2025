"use client";

import { useState } from "react";

const sections = [
  "Profile Settings",
  "Account",
  "Password",
  "Privacy and Safety",
  "Email Notifications",
  "Your Data",
  "Delete Account",
];

export default function Settings() {
  const [selected, setSelected] = useState<string>("Profile Settings");

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Username form state
  const [currentUsername, setCurrentUsername] = useState("krishna67");
  const [newUsername, setNewUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");

  // Delete confirmation modal
  const [showModal, setShowModal] = useState(false);

  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setPasswordMessage("Please fill out all fields.");
      return;
    }
    setPasswordMessage("Password updated successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle username update
  const handleUsernameUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) {
      setUsernameMessage("Please enter a new username.");
      return;
    }
    setCurrentUsername(newUsername);
    setUsernameMessage("Username updated successfully!");
    setNewUsername("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <ul className="space-y-2">
          {sections.map((section) => (
            <RippleButton
              key={section}
              label={section}
              active={selected === section}
              onClick={() => setSelected(section)}
            />
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main
        key={selected}
        className="flex-1 p-8 animate-fadeIn transition-all duration-500"
      >
        <h1 className="text-2xl font-semibold mb-4">{selected}</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Profile Settings */}
          {selected === "Profile Settings" && (
            <form
              onSubmit={handleUsernameUpdate}
              className="space-y-4 max-w-md animate-fadeIn"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Username
                </label>
                <input
                  type="text"
                  value={currentUsername}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Enter new username"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save Changes
              </button>

              {usernameMessage && (
                <p
                  className={`mt-2 text-sm ${
                    usernameMessage.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </form>
          )}

          {/* Password */}
          {selected === "Password" && (
            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-4 max-w-md animate-fadeIn"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Enter old password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save Changes
              </button>

              {passwordMessage && (
                <p
                  className={`mt-2 text-sm ${
                    passwordMessage.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}
            </form>
          )}

          {/* Account */}
          {selected === "Account" && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-gray-700">
                Manage your account details such as email and phone number.
              </p>
              <input
                type="email"
                placeholder="example@email.com"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="+1 (555) 123-4567"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700">
                Save Account Info
              </button>
            </div>
          )}

          {/* Privacy and Safety */}
          {selected === "Privacy and Safety" && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-gray-700">
                Control who can see your information and activity.
              </p>
              {[
                "Make my profile public",
                "Show activity status",
                "Allow friend requests",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="accent-blue-600 w-5 h-5 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Email Notifications */}
          {selected === "Email Notifications" && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-gray-700">
                Choose what email notifications you receive.
              </p>
              {[
                "Product updates",
                "Security alerts",
                "Weekly summaries",
                "Promotions and offers",
              ].map((label) => (
                <label key={label} className="flex items-center">
                  <input
                    type="checkbox"
                    className="accent-blue-600 mr-2 w-5 h-5 cursor-pointer"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          {/* Your Data */}
          {selected === "Your Data" && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-gray-700">
                Manage and export your personal data.
              </p>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800">
                Download My Data
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Manage Data Permissions
              </button>
            </div>
          )}

          {/* Delete Account */}
          {selected === "Delete Account" && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-red-600">
                Permanently delete your account and all related data. This
                action cannot be undone.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete My Account
              </button>

              {/* Modal */}
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                      Confirm Deletion
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to permanently delete your account?
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          alert("Account deleted successfully.");
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(6);
            opacity: 0;
          }
        }
        .ripple-circle {
          position: absolute;
          border-radius: 9999px;
          background-color: rgba(147, 197, 253, 0.6); /* blue-300 */
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

/* Ripple Button Component */
function RippleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(
    null
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, key: Date.now() });
    onClick();
    setTimeout(() => setRipple(null), 600);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden w-full text-left px-3 py-2 rounded-md transition-all duration-300 ${
        active
          ? "bg-blue-100 text-blue-700 font-medium"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {label}
      {ripple && (
        <span
          key={ripple.key}
          className="ripple-circle"
          style={{ top: ripple.y, left: ripple.x, width: 40, height: 40 }}
        />
      )}
    </button>
  );
}
