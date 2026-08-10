import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10 text-gray-800">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        {/* Header */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>

          <p className="mt-2 text-gray-500">
            Choose how you would like to join WorkConnect.
          </p>
        </div>

        {/* Role Cards */}

        <div className="space-y-5">
          <Link
            href="/register-customer"
            className="block rounded-xl border border-gray-300 p-6 transition hover:border-blue-500 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Customer</h2>

            <p className="mt-2 text-gray-500">
              Find trusted workers for your projects and manage service
              requests.
            </p>

            <p className="mt-4 font-medium text-blue-600">Continue →</p>
          </Link>

          <Link
            href="/register-worker"
            className="block rounded-xl border border-gray-300 p-6 transition hover:border-blue-500 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Worker</h2>

            <p className="mt-2 text-gray-500">
              Showcase your skills, receive job requests, and grow your
              business.
            </p>

            <p className="mt-4 font-medium text-blue-600">Continue →</p>
          </Link>
        </div>

        {/* Footer */}

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Already have an account?</span>{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
