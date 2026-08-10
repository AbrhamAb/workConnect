"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-800">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        {/* Progress */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Worker Registration</h1>

          <p className="mt-2 text-gray-500">Step {step} of 3</p>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-2 flex-1 rounded ${
                  number <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}

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

        {serverError && (
          <p className="mt-4 text-sm text-red-500">{serverError}</p>
        )}

        {/* Navigation */}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || isLoading}
            className="rounded-lg border px-5 py-2 disabled:opacity-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading
              ? "Creating Account..."
              : step === 3
                ? "Finish Registration"
                : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}
