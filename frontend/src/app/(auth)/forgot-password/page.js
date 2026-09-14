"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuthStore } from "@/store/authStore";
import { forgotPasswordSchema } from "@/validation/auth/forgotPassword";

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [serverMessage, setServerMessage] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data) {
    setServerMessage("");

    try {
      const response = await forgotPassword(data.email);

      setSent(true);
      setServerMessage(response.message);
      reset();
    } catch (error) {
      setSent(false);
      setServerMessage(error.message);
    }
  }

  const baseInputClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:ring-4";
  const normalInputClass =
    "border-gray-200 bg-gray-50 focus:border-[#1A362D] focus:bg-white focus:ring-[#1A362D]/10";
  const errorInputClass =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1A362D]/10 text-[#1A362D]">
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#142A23]">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we will send you a secure reset link.
          </p>
        </div>

        {sent ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-200/50 text-green-700">
                <svg
                  className="h-5 w-5"
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
              </div>
              <h2 className="font-bold text-green-800">Email Sent!</h2>
              <p className="mt-2 text-sm font-medium text-green-700">
                {serverMessage}
              </p>

              <Link
                href="/login"
                className="mt-5 block w-full rounded-xl bg-green-700 py-3 text-sm font-bold text-white transition-all hover:bg-green-800"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`${baseInputClass} ${
                    errors.email ? errorInputClass : normalInputClass
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {serverMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                  <p className="text-xs font-semibold text-red-600">
                    {serverMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-[#1A362D] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#132A22] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-[13px] font-medium">
              <span className="text-gray-500">Remember your password?</span>{" "}
              <Link
                href="/login"
                className="font-bold text-[#1A362D] transition-colors hover:text-[#132A22] hover:underline"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
