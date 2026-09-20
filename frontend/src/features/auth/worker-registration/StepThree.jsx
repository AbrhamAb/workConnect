"use client";

export default function StepThree({
  formData,
  setFormData,
  errors,
  setErrors,
}) {
  function handleBioChange(e) {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      bio: value,
    }));

    if (errors.bio) {
      setErrors((prev) => ({
        ...prev,
        bio: "",
      }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      profilePicture: file || null,
    }));

    if (errors.profilePicture) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "",
      }));
    }
  }

  const baseInputClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:ring-4";
  const normalInputClass =
    "border-gray-200 bg-gray-50 focus:border-[#1A362D] focus:bg-white focus:ring-[#1A362D]/10";
  const errorInputClass =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20";
  const labelClass = "mb-1.5 block text-[13px] font-semibold text-gray-700";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#142A23]">Profile Setup</h2>

      <p className="mt-1 mb-6 text-sm text-gray-500">
        Help WorkConnect customers learn more about you and your expertise.
      </p>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div>
          <label className={labelClass}>Profile Picture</label>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
              {formData.profilePicture ? (
                <span className="text-[10px] font-bold text-gray-500 uppercase text-center px-1">
                  {formData.profilePicture.name.substring(0, 4)}...
                </span>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[#1A362D] file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-white file:shadow-md file:transition-all hover:file:bg-[#132A22] active:file:scale-[0.98]"
              />
              <p className="mt-2 text-xs font-medium text-gray-400">
                Upload a professional photo. Max size 2MB.
              </p>
            </div>
          </div>

          {errors.profilePicture && (
            <p className="mt-2 text-xs font-medium text-red-500">
              {errors.profilePicture}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className={labelClass}>Professional Bio</label>

          <textarea
            rows={5}
            value={formData.bio}
            onChange={handleBioChange}
            placeholder="Tell customers about yourself, your experience, and the services you provide."
            className={`${baseInputClass} resize-none ${
              errors.bio ? errorInputClass : normalInputClass
            }`}
          />

          <div className="mt-1.5 flex justify-between px-1">
            <div>
              {errors.bio && (
                <p className="text-xs font-medium text-red-500">{errors.bio}</p>
              )}
            </div>

            <p
              className={`text-xs font-medium transition-colors ${formData.bio.length > 500 ? "text-red-500" : "text-gray-400"}`}
            >
              {formData.bio.length} characters
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#1A362D]/10 bg-[#1A362D]/5 p-4">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-[#1A362D]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-[13px] font-bold text-[#1A362D]">
              Good to know
            </h3>
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#1A362D]/75">
              You can always update your profile picture, bio, and add portfolio
              items later from your worker dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
