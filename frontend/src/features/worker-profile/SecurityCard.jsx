"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { useAuthStore } from "@/store/authStore";

export function SecurityCard() {
  const router = useRouter();

  const changePassword = useAuthStore((state) => state.changePassword);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage({ type: "", text: "" });
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setMessage({ type: "error", text: "New password must be different from the current password." });
      return;
    }

    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function handleLogout() {
    try {
      await logout();

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-[#1A362D]">Security</h3>

      <p className="mt-2 text-gray-500">
        Manage your password and account security.
      </p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <h4 className="font-semibold text-gray-900">Password</h4>

            <p className="mt-1 text-sm text-gray-500">Update your password securely.</p>
          </div>

          <div className="space-y-3">
            <input name="currentPassword" value={form.currentPassword} onChange={updateField} type="password" autoComplete="current-password" placeholder="Current password" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1A362D]" />
            <input name="newPassword" value={form.newPassword} onChange={updateField} type="password" autoComplete="new-password" placeholder="New password (8+ characters)" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1A362D]" />
            <input name="confirmPassword" value={form.confirmPassword} onChange={updateField} type="password" autoComplete="new-password" placeholder="Confirm new password" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1A362D]" />
            {message.text && <p className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>}
            <Button type="submit" variant="secondary" disabled={isLoading}>{isLoading ? "Updating..." : "Change Password"}</Button>
          </div>
        </div>
        </form>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <h4 className="font-semibold text-gray-900">Sign Out</h4>

            <p className="mt-1 text-sm text-gray-500">
              Sign out from your current device.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
    </Card>
  );
}
