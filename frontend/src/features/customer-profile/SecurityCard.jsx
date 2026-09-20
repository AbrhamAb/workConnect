"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { useAuthStore } from "@/store/authStore";

export default function SecurityCard() {
  const changePassword = useAuthStore((state) => state.changePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage({ type: "", text: "" });
  }

  async function handleSubmit(event) {
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

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}

        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">Security</h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your account password.
          </p>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Current Password */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Current Password
          </label>

          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={updateField}
            autoComplete="current-password"
            placeholder="Enter current password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#1A362D]"
          />
        </div>

        {/* New Password */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            New Password
          </label>

          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={updateField}
            autoComplete="new-password"
            placeholder="Enter new password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#1A362D]"
          />
        </div>

        {/* Confirm */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField}
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#1A362D]"
          />
        </div>

        {/* Security Note */}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Use a strong password with a mix of letters, numbers, and symbols to
            keep your account secure.
          </p>
        </div>

        {/* Button */}

        {message.text && (
          <p className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <div>
          <button type="submit" disabled={isLoading} className="rounded-xl bg-[#E8F5F1] px-6 py-3 font-semibold text-[#1A362D] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
        </form>
      </div>
    </Card>
  );
}
