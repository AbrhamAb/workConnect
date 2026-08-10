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

  return (
    <form>
      <h2 className="text-2xl font-semibold">Basic Information</h2>

      <p className="mt-2 mb-6 text-gray-500">
        Tell us a little about yourself.
      </p>

      <div className="space-y-5">
        {/* Full Name */}

        <div>
          <label className="mb-2 block text-sm font-medium">Full Name</label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.fullName
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.email
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}

        <div>
          <label className="mb-2 block text-sm font-medium">Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.phone
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Password */}

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.password
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Primary Skill */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Primary Skill
          </label>

          <select
            name="primarySkill"
            value={formData.primarySkill}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.primarySkill
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
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
            <p className="mt-1 text-sm text-red-500">{errors.primarySkill}</p>
          )}
        </div>

        {/* Experience */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Years of Experience
          </label>

          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.experience
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <option value="">Select experience</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1 - 2 years">1 - 2 years</option>
            <option value="3 - 5 years">3 - 5 years</option>
            <option value="5 - 10 years">5 - 10 years</option>
            <option value="10+ years">10+ years</option>
          </select>

          {errors.experience && (
            <p className="mt-1 text-sm text-red-500">{errors.experience}</p>
          )}
        </div>

        {/* City */}

        <div>
          <label className="mb-2 block text-sm font-medium">City</label>

          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              errors.city
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>
      </div>
    </form>
  );
}
