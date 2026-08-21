"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { VerificationNotice } from "@/features/worker-verification/VerificationNotice";
import { UploadGuidelines } from "@/features/worker-verification/UploadGuidelines";
import { GovernmentIdUpload } from "@/features/worker-verification/GovernmentIdUpload";
import { CertificateUpload } from "@/features/worker-verification/CertificateUpload";
import { getCurrentWorker } from "@/services/worker.service";
import {
  getVerificationStatus,
  submitVerification,
} from "@/services/verification.service";

export default function VerificationPage() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [governmentIdFile, setGovernmentIdFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [verificationRequest, setVerificationRequest] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadWorker() {
      try {
        const [currentWorker, currentVerification] = await Promise.all([
          getCurrentWorker(),
          getVerificationStatus().catch((statusError) => {
            if (statusError.message?.toLowerCase().includes("not found")) {
              return null;
            }
            throw statusError;
          }),
        ]);

        if (mounted) {
          setWorker(currentWorker);
          setVerificationRequest(currentVerification);
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

  function handleFileSelected(file, type) {
    if (type === "government_id") {
      setGovernmentIdFile(file);
    } else if (type === "certificate") {
      setCertificateFile(file);
    }
  }

  async function handleSubmit() {
    setError("");
    setSubmitMessage("");

    const documents = [];
    if (governmentIdFile) {
      documents.push({ type: "government_id", file: governmentIdFile });
    }
    if (certificateFile) {
      documents.push({
        type: "professional_certificate",
        file: certificateFile,
      });
    }

    if (documents.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    try {
      setSubmitting(true);
      const submittedRequest = await submitVerification(documents);
      setVerificationRequest(submittedRequest);
      setSubmitMessage("Verification submitted successfully. Our team will review your documents.");
      setGovernmentIdFile(null);
      setCertificateFile(null);
    } catch (err) {
      setError(err.message || "Unable to submit verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
      ) : submitMessage ? (
        <Card className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center text-green-600">
          {submitMessage}
        </Card>
      ) : (
        <div className="space-y-4">
          <VerificationNotice worker={worker} />
          {verificationRequest?.status && (
            <Card className="border-blue-100 bg-blue-50">
              <p className="text-sm font-semibold text-blue-900">
                Verification status: {verificationRequest.status}
              </p>
              {verificationRequest.rejectionReason && (
                <p className="mt-1 text-sm text-blue-800">
                  {verificationRequest.rejectionReason}
                </p>
              )}
            </Card>
          )}
        </div>
      )}

      {!submitMessage && (
        <>
          <UploadGuidelines />

          <GovernmentIdUpload
            onFileSelected={handleFileSelected}
            selectedFile={governmentIdFile}
          />

          <CertificateUpload
            onFileSelected={handleFileSelected}
            selectedFile={certificateFile}
          />

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
                <Button variant="secondary" disabled={submitting}>
                  Cancel
                </Button>

                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Verification"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
