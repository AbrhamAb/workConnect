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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl font-bold text-[#142A23]">Skills & Services</h2>

      <p className="mt-1 mb-6 text-sm text-gray-500">
        Select all the primary and secondary services you offer to customers.
      </p>

      {/* Skill Cards Grid */}
      <div>
        <label className="mb-2.5 block text-[13px] font-semibold text-gray-700">
          Popular Services
        </label>

        <div
          className={`grid grid-cols-2 gap-3 ${
            errors.skills
              ? "rounded-2xl border-2 border-red-300 p-2 bg-red-50/30"
              : ""
          }`}
        >
          {availableSkills.map((skill) => {
            const isSelected = formData.skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`relative flex items-center justify-between rounded-xl p-3.5 text-left text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-[#1A362D] bg-[#1A362D]/5 text-[#1A362D] shadow-sm"
                    : "border border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-300 hover:bg-gray-100/70"
                }`}
              >
                <span>{skill}</span>
                {isSelected ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A362D] text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="h-5 w-5 rounded-full border border-gray-300 bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {errors.skills && (
          <p className="mt-2 text-xs font-medium text-red-500">
            {errors.skills}
          </p>
        )}
      </div>

      {/* Custom Skill Section */}
      <div className="mt-8">
        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
          Add Custom Skill
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Solar Installation"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1A362D] focus:bg-white focus:ring-4 focus:ring-[#1A362D]/10"
          />

          <button
            type="button"
            onClick={addCustomSkill}
            className="rounded-xl bg-[#1A362D] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#132A22] active:scale-[0.98]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Skills Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13px] font-semibold text-gray-700">
            Selected Skills
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {formData.skills.length} selected
          </span>
        </div>

        <div className="min-h-[60px] rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5">
          {formData.skills.length === 0 ? (
            <div className="flex items-center justify-center py-3 text-center text-xs font-medium text-gray-400">
              No skills selected yet. Pick from above or add your own.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="group flex items-center gap-1.5 rounded-full border border-[#1A362D]/20 bg-[#1A362D]/10 px-3.5 py-1.5 text-xs font-semibold text-[#1A362D] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Click to remove"
                >
                  <span>{skill}</span>
                  <svg
                    className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
