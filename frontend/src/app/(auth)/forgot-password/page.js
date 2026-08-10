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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10 text-gray-800">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>

          <p className="mt-2 text-gray-800">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <h2 className="font-semibold text-green-700">Email Sent!</h2>

            <p className="mt-2 text-sm text-green-600">{serverMessage}</p>

            <Link
              href="/login"
              className="mt-4 inline-block font-semibold text-blue-600 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`w-full rounded-lg border px-4 py-3 outline-none ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {serverMessage && (
                <p className="text-sm text-red-500">{serverMessage}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Remember your password?</span>{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
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
