import { delay } from "@/lib/delay";
import { apiGet, apiPost } from "./api.service";

/**
 * Converts a File object to a base64 data URL.
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Submits a worker verification request with documents.
 * Each document should have type and file (File object).
 */
export async function submitVerification(documents) {
  await delay();

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("At least one document is required for verification.");
  }

  const processedDocs = [];
  for (const doc of documents) {
    if (!doc.type || !doc.file) {
      throw new Error("Each document must have a type and file.");
    }

    const fileUrl = await fileToBase64(doc.file);
    processedDocs.push({
      type: doc.type,
      fileUrl,
    });
  }

  const response = await apiPost("/worker/verification", {
    documents: processedDocs,
  });

  return response?.verificationRequest || response;
}

/**
 * Retrieves the current worker's verification status.
 */
export async function getVerificationStatus() {
  await delay();

  const response = await apiGet("/worker/verification");
  return response?.verificationRequest || response;
}
