"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

import { updateCustomer } from "@/services/customer.service";
import { validateSchema } from "@/validation/helpers";
import { customerProfileSchema } from "@/validation/customer/profile";

export default function PersonalInfoCard({ customer, onCustomerUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(() => ({
    fullName: customer.fullName || customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    city: customer.city || "",
    address: customer.address || "",
  }));

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");

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
    setFormData({
      fullName: customer.fullName || customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      city: customer.city || "",
      address: customer.address || "",
    });

    setErrors({});
    setSaveError("");
    setIsEditing(false);
  }

  async function handleSave() {
    const validation = await validateSchema(customerProfileSchema, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});
      setSaveError("");

      const updatedCustomer = await updateCustomer(formData);

      if (updatedCustomer) {
        onCustomerUpdated(updatedCustomer);
        setIsEditing(false);
      }
    } catch (error) {
      setSaveError(error.message || "Failed to update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your account details.
          </p>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {saveError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {saveError}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                isEditing
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
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                isEditing
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
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                isEditing
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
              City
            </label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
              }`}
            />

            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Address
          </label>

          <textarea
            rows={4}
            name="address"
            value={formData.address}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${
              isEditing
                ? "border-gray-300 bg-white"
                : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
