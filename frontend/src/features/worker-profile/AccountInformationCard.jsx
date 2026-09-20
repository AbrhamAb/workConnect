"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

import { updateWorker } from "@/services/worker.service";
import { validateSchema } from "@/validation/helpers";
import { workerProfileSchema } from "@/validation/worker/profile";

export function AccountInformationCard({ worker, onWorkerUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(() => ({
    fullName: worker?.fullName || "",
    email: worker?.email || "",
    phone: worker?.phone || "",
    city: worker?.city || "",
    primarySkill: worker?.primarySkill || "",
    experience: worker?.experience || 0,
    bio: worker?.bio || "",
    skills: worker?.skills || [],
  }));

  const [errors, setErrors] = useState({});

  function resetForm() {
    setFormData({
      fullName: worker?.fullName || "",
      email: worker?.email || "",
      phone: worker?.phone || "",
      city: worker?.city || "",
      primarySkill: worker?.primarySkill || "",
      experience: worker?.experience || 0,
      bio: worker?.bio || "",
      skills: worker?.skills || [],
    });
  }

  function handleEdit() {
    resetForm();
    setErrors({});
    setIsEditing(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function handleCancel() {
    resetForm();
    setErrors({});
    setIsEditing(false);
  }

  async function handleSave() {
    const validation = await validateSchema(workerProfileSchema, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});

      const updatedWorker = await updateWorker({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      if (updatedWorker) {
        onWorkerUpdated(updatedWorker);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A362D]">
            Account Information
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Update your personal account details.
          </p>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
              errors.fullName
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
              errors.email
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
              errors.phone
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Password
          </label>

          <input
            type="password"
            value="************"
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
          />

          <p className="mt-2 text-sm text-gray-500">
            Password management will be available in the Security section.
          </p>
        </div>
      </div>
    </Card>
  );
}