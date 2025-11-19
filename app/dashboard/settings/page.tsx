"use client";

import { useState, useEffect } from "react";
import { User, Lock, Settings, Shield, Download, Trash2, Loader2, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

type Tab = "profile" | "preferences" | "account" | "privacy";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Profile updated successfully");
        setUser(data.user);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `studyflux-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data exported successfully");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmationText = prompt(
      'To delete your account, type "DELETE MY ACCOUNT" below:'
    );

    if (!confirmationText) return;

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationText }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account deleted successfully");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "preferences" as Tab, label: "Preferences", icon: Settings },
    { id: "account" as Tab, label: "Account", icon: Lock },
    { id: "privacy" as Tab, label: "Privacy", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Avatar URL
                    </label>
                    <div className="flex items-center gap-4">
                      {user?.image && (
                        <img
                          src={user.image}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter a URL to your profile picture
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notifications
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive email updates about your activity
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Push Notifications
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushNotifications}
                            onChange={(e) => setPushNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Security
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      minLength={8}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "privacy" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Privacy & Data
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Export Your Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Download all your data in JSON format. This includes your profile,
                      documents, flashcards, study sessions, and more.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Export Data
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Permanently delete your account and all associated data. This action
                      cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
