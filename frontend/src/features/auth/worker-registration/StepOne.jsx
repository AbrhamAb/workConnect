"use client";

export default function StepOne({ formData, setFormData, errors, setErrors }) {
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  const baseInputClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:ring-4";
  const normalInputClass =
    "border-gray-200 bg-gray-50 focus:border-[#1A362D] focus:bg-white focus:ring-[#1A362D]/10";
  const errorInputClass =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20";
  const labelClass = "mb-1.5 block text-[13px] font-semibold text-gray-700";

  return (
    <form className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl font-bold text-[#142A23]">Basic Information</h2>

      <p className="mt-1 mb-6 text-sm text-gray-500">
        Lets start with your personal and professional details.
      </p>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className={`${baseInputClass} ${
              errors.fullName ? errorInputClass : normalInputClass
            }`}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`${baseInputClass} ${
                errors.email ? errorInputClass : normalInputClass
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+251 911 234 567"
              className={`${baseInputClass} ${
                errors.phone ? errorInputClass : normalInputClass
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Password & Confirm Password Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`${baseInputClass} ${
                errors.password ? errorInputClass : normalInputClass
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`${baseInputClass} ${
                errors.confirmPassword ? errorInputClass : normalInputClass
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Primary Skill & Experience Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Primary Skill</label>
            <select
              name="primarySkill"
              value={formData.primarySkill}
              onChange={handleChange}
              className={`${baseInputClass} cursor-pointer appearance-none ${
                errors.primarySkill ? errorInputClass : normalInputClass
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.2em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Choose a skill</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Welder">Welder</option>
              <option value="Other">Other</option>
            </select>
            {errors.primarySkill && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.primarySkill}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Years of Experience</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className={`${baseInputClass} cursor-pointer appearance-none ${
                errors.experience ? errorInputClass : normalInputClass
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.2em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Select experience</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1 - 2 years">1 - 2 years</option>
              <option value="3 - 5 years">3 - 5 years</option>
              <option value="5 - 10 years">5 - 10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
            {errors.experience && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.experience}
              </p>
            )}
          </div>
        </div>

        {/* City (Full Width) */}
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Addis Ababa"
            className={`${baseInputClass} ${
              errors.city ? errorInputClass : normalInputClass
            }`}
          />
          {errors.city && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.city}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
