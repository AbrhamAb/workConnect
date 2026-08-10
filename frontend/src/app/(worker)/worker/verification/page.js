"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { VerificationNotice } from "@/features/worker-verification/VerificationNotice";
import { UploadGuidelines } from "@/features/worker-verification/UploadGuidelines";
import { GovernmentIdUpload } from "@/features/worker-verification/GovernmentIdUpload";
import { CertificateUpload } from "@/features/worker-verification/CertificateUpload";
import { getCurrentWorker } from "@/services/worker.service";

export default function VerificationPage() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadWorker() {
      try {
        const currentWorker = await getCurrentWorker();

        if (mounted) {
          setWorker(currentWorker);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load your verification status.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWorker();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A362D]">
          Verify Your Account
        </h1>

        <p className="mt-2 max-w-3xl text-gray-500">
          Upload your identification and professional certificate to become a
          verified worker. Verification helps customers trust your profile and
          increases your visibility across the platform.
        </p>
      </div>

      {loading ? (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          Loading your verification status...
        </Card>
      ) : error ? (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error}
        </Card>
      ) : (
        <VerificationNotice worker={worker} />
      )}

      <UploadGuidelines />

      <GovernmentIdUpload />

      <CertificateUpload />

      {/* Footer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Ready to submit?</h3>

            <p className="mt-1 text-sm text-gray-500">
              Please make sure both documents are uploaded and clearly visible.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary">Cancel</Button>

            <Button variant="primary">Submit Verification</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
