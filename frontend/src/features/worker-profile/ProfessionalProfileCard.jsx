"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

import { updateWorker } from "@/services/worker.service";
import { validateSchema } from "@/validation/helpers";
import { workerProfileSchema } from "@/validation/worker/profile";

export function ProfessionalProfileCard({ worker, onWorkerUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(() => createFormData(worker));

  const [newSkill, setNewSkill] = useState("");
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "experience" ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function createFormData(worker) {
    return {
      fullName: worker?.fullName || "",
      email: worker?.email || "",
      phone: worker?.phone || "",
      city: worker?.city || "",
      primarySkill: worker?.primarySkill || "",
      experience: worker?.experience || 0,
      bio: worker?.bio || "",
      skills: worker?.skills || [],
    };
  }

  function addSkill() {
    const skill = newSkill.trim();

    if (!skill) return;

    if (formData.skills.includes(skill)) {
      setNewSkill("");
      return;
    }

    setFormData((current) => ({
      ...current,
      skills: [...current.skills, skill],
    }));

    setNewSkill("");

    if (errors.skills) {
      setErrors((current) => ({
        ...current,
        skills: "",
      }));
    }
  }

  function removeSkill(skill) {
    setFormData((current) => ({
      ...current,
      skills: current.skills.filter((item) => item !== skill),
    }));
  }

  function handleCancel() {
    setFormData(createFormData(worker));

    setErrors({});
    setSaveError("");
    setNewSkill("");
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
      setSaveError("");

      const updatedWorker = await updateWorker({
        primarySkill: formData.primarySkill,
        experience: formData.experience,
        city: formData.city,
        bio: formData.bio,
        skills: formData.skills,
      });

      if (updatedWorker) {
        onWorkerUpdated(updatedWorker);
        setIsEditing(false);
      }
    } catch (error) {
      setSaveError(
        error.message || "Failed to update your professional profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A362D]">
            Professional Profile
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            This information is shown on your public worker profile.
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
          <Button
            variant="secondary"
            onClick={() => {
              setFormData(createFormData(worker));
              setErrors({});
              setSaveError("");
              setNewSkill("");
              setIsEditing(true);
            }}
          >
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
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Primary Skill
          </label>

          <input
            type="text"
            name="primarySkill"
            value={formData.primarySkill}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
              errors.primarySkill
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.primarySkill && (
            <p className="mt-1 text-sm text-red-500">{errors.primarySkill}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Years of Experience
          </label>

          <input
            type="number"
            min="0"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
              errors.experience
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.experience && (
            <p className="mt-1 text-sm text-red-500">{errors.experience}</p>
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
              errors.city
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Skills
          </label>

          <div
            className={`rounded-xl border p-4 ${
              errors.skills ? "border-red-500" : "border-gray-200"
            }`}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 rounded-full bg-[#E8F5F1] px-3 py-1 text-sm font-medium text-[#1A362D]"
                >
                  {skill}

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="font-bold hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  placeholder="Add a skill..."
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none"
                />

                <Button type="button" variant="secondary" onClick={addSkill}>
                  Add
                </Button>
              </div>
            )}

            {errors.skills && (
              <p className="mt-2 text-sm text-red-500">{errors.skills}</p>
            )}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            About
          </label>

          <textarea
            rows={6}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${
              errors.bio
                ? "border-red-500"
                : isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50"
            }`}
          />

          {errors.bio && (
            <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {formData.bio.length}/500 characters
          </p>
        </div>
      </div>
    </Card>
  );
}
