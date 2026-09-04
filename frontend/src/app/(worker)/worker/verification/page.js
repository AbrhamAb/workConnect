"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { VerificationNotice } from "@/features/worker-verification/VerificationNotice";
import { UploadGuidelines } from "@/features/worker-verification/UploadGuidelines";
import { GovernmentIdUpload } from "@/features/worker-verification/GovernmentIdUpload";
import { CertificateUpload } from "@/features/worker-verification/CertificateUpload";
import {
  getCurrentWorker,
  uploadVerificationDocument,
  submitWorkerVerification,
} from "@/services/worker.service";

export default function VerificationPage() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState({
    government_id: null,
    professional_certificate: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleFileChange(documentType, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
      setError("Please upload a PNG, JPG, or PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Each document must be smaller than 10 MB.");
      return;
    }

    setError("");
    setDocuments((current) => ({ ...current, [documentType]: file }));
  }

  async function handleSubmitVerification() {
    if (!documents.government_id || !documents.professional_certificate) {
      setError("Upload both documents before submitting verification.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      for (const [documentType, file] of Object.entries(documents)) {
        const fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Unable to read the selected file."));
          reader.readAsDataURL(file);
        });

        await uploadVerificationDocument({
          documentType,
          fileUrl,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        });
      }

      await submitWorkerVerification();
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Unable to submit verification.");
    } finally {
      setSubmitting(false);
    }
  }

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

      <GovernmentIdUpload
        file={documents.government_id}
        onFileChange={(event) => handleFileChange("government_id", event)}
      />

      <CertificateUpload
        file={documents.professional_certificate}
        onFileChange={(event) => handleFileChange("professional_certificate", event)}
      />

      {error && (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </Card>
      )}

      {submitted && (
        <Card className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          Verification submitted successfully. An administrator will review your documents.
        </Card>
      )}

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

            <Button
              variant="primary"
              disabled={submitting || submitted}
              onClick={handleSubmitVerification}
            >
              {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Verification"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
