"use client";

export default function RequestForm({ formData, setFormData, errors = {} }) {
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    setFormData((prev) => ({
      ...prev,
      photos: Array.from(e.target.files),
    }));
  }

  return (
    <div className="space-y-8">
      {/* Title */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Title
        </label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter the title of the issue"
          className={`w-full rounded-xl bg-gray-50 px-4 py-3 outline-none transition focus:bg-white ${
            errors.title
              ? "border border-red-500 focus:border-red-500"
              : "border border-gray-200 focus:border-[#1A362D]"
          }`}
        />

        {errors.title && (
          <p className="mt-2 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Describe the Issue
        </label>

        <textarea
          rows={6}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly explain what you need help with (e.g. leaking faucet, wiring installation, furniture assembly...)"
          className={`w-full resize-none rounded-xl bg-gray-50 px-4 py-3 outline-none transition focus:bg-white ${
            errors.description
              ? "border border-red-500 focus:border-red-500"
              : "border border-gray-200 focus:border-[#1A362D]"
          }`}
        />

        {errors.description ? (
          <p className="mt-2 text-sm text-red-600">{errors.description}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Include as many details as possible for a more accurate quote.
          </p>
        )}
      </div>

      {/* Row */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Location */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Your Location
          </label>

          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Area or Street"
              className={`w-full rounded-xl bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:bg-white ${
                errors.location
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-gray-200 focus:border-[#1A362D]"
              }`}
            />
          </div>

          {errors.location && (
            <p className="mt-2 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Date */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Preferred Date & Time
          </label>

          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>

            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full rounded-xl bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:bg-white ${
                errors.date
                  ? "border border-red-500 focus:border-red-500"
                  : "border border-gray-200 focus:border-[#1A362D]"
              }`}
            />
          </div>

          {errors.date && (
            <p className="mt-2 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Budget */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Estimated Budget
          <span className="ml-2 text-gray-400">(Optional)</span>
        </label>

        <input
          type="text"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          placeholder="Flexible or enter an estimated budget"
          className={`w-full rounded-xl bg-gray-50 px-4 py-3 outline-none transition focus:bg-white ${
            errors.budget
              ? "border border-red-500 focus:border-red-500"
              : "border border-gray-200 focus:border-[#1A362D]"
          }`}
        />

        {errors.budget && (
          <p className="mt-2 text-sm text-red-600">{errors.budget}</p>
        )}
      </div>

      {/* Photos */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Upload Photos
          <span className="ml-2 text-gray-400">(Optional)</span>
        </label>

        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50 px-6 py-10 transition hover:bg-white ${
            errors.photos
              ? "border-red-500"
              : "border-gray-300 hover:border-[#1A362D]"
          }`}
        >
          <svg
            className="mb-4 h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="font-semibold text-gray-700">Click to upload photos</p>

          <p className="mt-1 text-sm text-gray-500">JPG, PNG or WEBP</p>

          {formData.photos.length > 0 && (
            <p className="mt-4 text-sm font-medium text-[#1A362D]">
              {formData.photos.length} file(s) selected
            </p>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {errors.photos && (
          <p className="mt-2 text-sm text-red-600">{errors.photos}</p>
        )}
      </div>
    </div>
  );
}
