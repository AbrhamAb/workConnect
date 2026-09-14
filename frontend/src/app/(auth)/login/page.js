"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuthStore } from "@/store/authStore";
import { loginSchema } from "@/validation/auth/login";

export default function LoginPage() {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      const user = await login(data.email, data.password);

      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "customer") {
        router.push("/customer/dashboard");
      } else if (user.role === "worker") {
        router.push("/worker/dashboard");
      } else {
        router.push("/login");
      }
    } catch (error) {
      setServerError(error.message);
    }
  }

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
      <div className="w-full max-w-[26rem] rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:p-10">
        {/* Auth Toggle */}
        <div className="mb-8 flex w-full rounded-xl bg-gray-100/80 p-1 border border-gray-200/50">
          <div className="w-1/2 rounded-lg bg-white py-2.5 text-center text-sm font-bold text-[#1A362D] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            Login
          </div>
          <Link
            href="/register"
            className="w-1/2 rounded-lg py-2.5 text-center text-sm font-semibold text-gray-500 transition-colors hover:text-[#1A362D]"
          >
            Create Account
          </Link>
        </div>

        {/* Header Texts */}
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-bold text-[#142A23]">Welcome back</h1>
          <p className="mt-2 text-[13px] font-medium text-gray-500">
            Please enter your details to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Email or Phone
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

          {/* Password Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#A87C22] transition-colors hover:text-[#876218]"
              >
                Forgot Password?
              </Link>
            </div>
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

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              {...register("remember")}
              className="h-4 w-4 rounded border-gray-300 text-[#1A362D] focus:ring-[#1A362D]"
            />
            <span className="text-[13px] font-medium text-gray-600">
              Remember me
            </span>
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-600">
                {serverError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A362D] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1A362D]/20 transition-all hover:bg-[#132A22] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing In..." : "Login"}
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
      </div>

      {/* Footer Links */}
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
