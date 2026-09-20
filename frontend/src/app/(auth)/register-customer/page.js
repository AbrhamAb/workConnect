"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuthStore } from "@/store/authStore";
import { customerRegistrationSchema } from "@/validation/auth/customerRegistration";

export default function RegisterCustomerPage() {
  const router = useRouter();

  const registerCustomer = useAuthStore((state) => state.registerCustomer);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      await registerCustomer(data);
      router.push("/customer/dashboard");
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4 py-10 font-sans text-gray-800">
      {/* Brand Logo Header */}
      <div className="mb-8 flex flex-col items-center">
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
      <div className="relative w-full max-w-[32rem] rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:p-10">
        {/* Back Button */}
        <Link
          href="/register"
          className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:left-8 sm:top-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        {/* Header Texts */}
        <div className="mb-8 text-center pt-2">
          <h1 className="text-[22px] font-bold text-[#142A23]">
            Customer Account
          </h1>
          <p className="mt-2 text-[13px] font-medium text-gray-500">
            Join WorkConnect to find trusted professionals.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="John Doe"
                {...register("fullName")}
                className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:ring-2 ${
                  errors.fullName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:ring-2 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone & City Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register("phone")}
                  className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:ring-2 ${
                    errors.phone
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                City
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="New York"
                  {...register("city")}
                  className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:ring-2 ${
                    errors.city
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                  }`}
                />
              </div>
              {errors.city && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#1A362D] focus:ring-[#1A362D]/20"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {serverError && (
            <div className="mt-2 rounded-lg bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-600">
                {serverError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A362D] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1A362D]/20 transition-all hover:bg-[#132A22] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            {!isLoading && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] font-medium text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#1A362D] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
