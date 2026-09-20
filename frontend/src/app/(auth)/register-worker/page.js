"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/store/authStore";

import StepOne from "@/features/auth/worker-registration/StepOne";
import StepTwo from "@/features/auth/worker-registration/StepTwo";
import StepThree from "@/features/auth/worker-registration/StepThree";

import { workerSchemas } from "@/validation/auth/workerRegistration";
import { validateSchema } from "@/validation/helpers";

export default function RegisterWorkerPage() {
  const router = useRouter();

  const registerWorker = useAuthStore((state) => state.registerWorker);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",

    password: "",
    confirmPassword: "",

    primarySkill: "",
    experience: "",
    city: "",

    skills: [],

    profilePicture: null,

    bio: "",
  });

  async function nextStep() {
    const schema = workerSchemas[step];

    if (schema) {
      const result = await validateSchema(schema, formData);

      if (!result.isValid) {
        setErrors(result.errors);
        return;
      }
    }

    setErrors({});
    setServerError("");

    if (step === 3) {
      try {
        await registerWorker(formData);

        router.replace("/worker/dashboard");
      } catch (error) {
        if (error.message === "An account with this email already exists.") {
          setStep(1);

          setErrors({
            email: error.message,
          });

          return;
        }

        setServerError(error.message);
      }

      return;
    }

    setStep((prev) => prev + 1);
  }

  function prevStep() {
    setErrors({});
    setServerError("");

    setStep((prev) => Math.max(prev - 1, 1));
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

      <div className="relative w-full max-w-[36rem] rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:p-10">
        {/* Abort/Back to Role Selection */}
        <Link
          href="/register"
          className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:left-8 sm:top-8"
          title="Back to role selection"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>

        {/* Progress Header */}
        <div className="mb-8 text-center pt-2">
          <h1 className="text-[22px] font-bold text-[#142A23]">
            Worker Registration
          </h1>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Step {step} of 3
          </p>

          <div className="mt-5 flex gap-2 w-full max-w-xs mx-auto">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  number <= step ? "bg-[#1A362D]" : "bg-gray-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="min-h-[350px]">
          {step === 1 && (
            <StepOne
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {step === 2 && (
            <StepTwo
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {step === 3 && (
            <StepThree
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          )}
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-center border border-red-100">
            <p className="text-sm font-semibold text-red-600">{serverError}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 px-6 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1A362D] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#1A362D]/20 transition-all hover:bg-[#132A22] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading
              ? "Processing..."
              : step === 3
                ? "Complete Registration"
                : "Continue"}
            {!isLoading && step !== 3 && (
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {!isLoading && step === 3 && (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
