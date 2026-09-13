import { Card } from "@/components/card";

export default function SecurityCard() {
  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}

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

        <div>
          <button className="rounded-xl bg-[#E8F5F1] px-6 py-3 font-semibold text-[#1A362D] transition hover:opacity-90">
            Update Password
          </button>
        </div>
      </div>
    </Card>
  );
}
