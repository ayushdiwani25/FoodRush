import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, updateProfile } from "@/redux";
import { AddressManagement } from "@/components";
import { m } from "framer-motion";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-4 font-semibold border-b-4 transition ${
        active
          ? "border-orange-500 text-orange-600"
          : "border-transparent text-gray-600 hover:text-orange-500"
      }`}
    >
      {label}
    </button>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <m.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg p-5 shadow-md border-2 border-gray-200"
    >
      <p className="text-gray-600 text-sm font-semibold mb-2">{icon} {label}</p>
      <p className="text-xl font-bold text-gray-800">{value || "Not added"}</p>
    </m.div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector(state => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user || {});
  const [activeTab, setActiveTab] = useState("profile");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200"
        >
          <p className="text-6xl mb-4">🔐</p>
          <p className="text-2xl font-bold text-gray-800 mb-4">Please login to view your profile</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold"
          >
            Go to Login
          </button>
        </m.div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError("");
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: editData.name || user.name,
        phone: editData.phone || "",
      });

      dispatch(updateProfile({
        name: editData.name || user.name,
        phone: editData.phone || "",
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </m.div>

        <div className="flex gap-4 mb-8 border-b-2 border-gray-300">
          <TabButton active={activeTab === "profile"} label="Profile" onClick={() => setActiveTab("profile")} />
          <TabButton active={activeTab === "addresses"} label="Addresses" onClick={() => setActiveTab("addresses")} />
          <TabButton active={activeTab === "settings"} label="Settings" onClick={() => setActiveTab("settings")} />
        </div>

        {activeTab === "profile" && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-linear-to-r from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg border-2 border-orange-200"
          >
            {!isEditing ? (
              <div>
                <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-orange-300">
                  <m.div
                    whileHover={{ scale: 1.1 }}
                    className="w-24 h-24 bg-linear-to-r from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center text-5xl font-bold shadow-lg"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </m.div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-gray-800">{user?.name}</h2>
                    <p className="text-lg text-orange-600 font-semibold mt-2">📧 {user?.email}</p>
                    <p className="text-sm text-gray-600">👤 {user?.isAdmin ? "👑 Admin Account" : "👤 Regular User"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <InfoCard icon="📱" label="Phone" value={user?.phone} />
                  <InfoCard icon="📅" label="Member Since" value={user?.memberSince} />
                  <InfoCard icon="🔐" label="Account Type" value={user?.isAdmin ? "👑 Admin" : "👤 User"} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditData(user);
                    setIsEditing(true);
                  }}
                  className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Profile</h3>

                {saveError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 font-semibold">
                    {saveError}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email (Read-only)</label>
                    <input
                      type="email"
                      value={editData.email || ""}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone || ""}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-bold disabled:opacity-50"
                  >
                    {saveLoading ? "Saving..." : "💾 Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </m.div>
        )}

        {activeTab === "addresses" && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AddressManagement />
          </m.div>
        )}

        {activeTab === "settings" && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">⚙️ Settings</h3>

            <div className="mb-10 bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
              <h4 className="text-lg font-bold text-gray-800 mb-4">ℹ️ Account Information</h4>
              <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
              <p className="text-gray-700"><strong>Account Type:</strong> {user?.isAdmin ? "👑 Admin" : "👤 User"}</p>
              <p className="text-gray-700"><strong>Member Since:</strong> {user?.memberSince}</p>
            </div>

            <m.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full px-8 py-4 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-bold text-lg shadow-lg"
            >
              🚪 Logout
            </m.button>
          </m.div>
        )}

      </div>
    </div>
  );
}
