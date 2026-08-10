"use client";

import { useState } from "react";

export default function StepTwo({ formData, setFormData, errors, setErrors }) {
  const [customSkill, setCustomSkill] = useState("");

  const availableSkills = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Cleaning",
    "Mechanic",
    "Welding",
    "Appliance Repair",
  ];

  function clearSkillError() {
    if (errors.skills) {
      setErrors((prev) => ({
        ...prev,
        skills: "",
      }));
    }
  }

  function toggleSkill(skill) {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);

      return {
        ...prev,
        skills: exists
          ? prev.skills.filter((item) => item !== skill)
          : [...prev.skills, skill],
      };
    });

    clearSkillError();
  }

  function addCustomSkill() {
    const value = customSkill.trim();

    if (!value) return;

    if (!formData.skills.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, value],
      }));

      clearSkillError();
    }

    setCustomSkill("");
  }

  function removeSkill(skill) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Skills & Services</h2>

      <p className="mt-2 mb-6 text-gray-500">
        Select the services you provide.
      </p>

      {/* Skill Cards */}

      <div
        className={`grid grid-cols-2 gap-3 rounded-lg p-2 ${
          errors.skills ? "border border-red-500" : ""
        }`}
      >
        {availableSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`rounded-lg border p-4 text-left transition ${
              formData.skills.includes(skill)
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {errors.skills && (
        <p className="mt-2 text-sm text-red-500">{errors.skills}</p>
      )}

      {/* Custom Skill */}

      <div className="mt-8">
        <label className="mb-2 block text-sm font-medium">
          Additional Skill
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a custom skill"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={addCustomSkill}
            className="rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Skills */}

      <div className="mt-8">
        <h3 className="font-semibold">Selected Skills</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {formData.skills.length === 0 ? (
            <div className="w-full rounded-lg border border-dashed border-gray-300 p-4 text-gray-500">
              No skills selected yet.
            </div>
          ) : (
            formData.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => removeSkill(skill)}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700 hover:bg-blue-200"
              >
                {skill} ✕
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
