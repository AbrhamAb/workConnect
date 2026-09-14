import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4 py-10 font-sans text-gray-800">
      {/* Brand Logo Header */}
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A362D] text-white shadow-md">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-[#1A362D]">
              WorkConnect
            </span>
            <div className="h-1 w-8 bg-yellow-400 mt-0.5 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[28rem] rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:p-10">
        {/* Auth Toggle */}
        <div className="mb-8 flex w-full rounded-xl bg-gray-100/80 p-1 border border-gray-200/50">
          <Link
            href="/login"
            className="w-1/2 rounded-lg py-2.5 text-center text-sm font-semibold text-gray-500 transition-colors hover:text-[#1A362D]"
          >
            Login
          </Link>
          <div className="w-1/2 rounded-lg bg-white py-2.5 text-center text-sm font-bold text-[#1A362D] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            Create Account
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Card */}
          <Link
            href="/register-customer"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-gray-100/80 bg-white p-5 shadow-sm transition-all hover:border-[#E6F0EC] hover:shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100/80 text-[#1A362D] transition-colors group-hover:bg-[#E6F0EC]">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>

            <h2 className="mb-4 text-sm font-bold text-[#142A23]">
              Join As Customer
            </h2>

            <div className="w-full rounded-xl bg-[#E6F0EC] py-2.5 text-center text-xs font-bold text-[#1A362D] transition-colors group-hover:bg-[#d5e6df]">
              Create Account
            </div>
          </Link>

          {/* Worker Card */}
          <Link
            href="/register-worker"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-gray-100/80 bg-white p-5 shadow-sm transition-all hover:border-[#1A362D]/20 hover:shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100/80 text-[#1A362D] transition-colors group-hover:bg-gray-200">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <h2 className="mb-4 text-sm font-bold text-[#142A23]">
              Join As Worker
            </h2>

            <div className="w-full rounded-xl bg-[#1A362D] py-2.5 text-center text-xs font-bold text-white shadow-md shadow-[#1A362D]/10 transition-colors group-hover:bg-[#132A22]">
              Create Account
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 max-w-[280px] text-center text-xs font-medium text-gray-500">
        By signing in, you agree to our{" "}
        <Link href="#" className="font-bold text-[#1A362D] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="font-bold text-[#1A362D] hover:underline">
          Privacy Policy
        </Link>
        .
      </div>
    </main>
  );
}
