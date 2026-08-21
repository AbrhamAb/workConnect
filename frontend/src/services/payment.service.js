import { delay } from "@/lib/delay";
import { apiPost } from "./api.service";

/**
 * Initiates a payment for a service request.
 * Minimal implementation for P1: creates payment record with pending status
 */
export async function initiatePayment(requestID, amountETB, provider = "cash") {
  await delay();

  if (!requestID || amountETB <= 0) {
    throw new Error("Request ID and amount are required.");
  }

  const numericRequestID = Number(String(requestID).replace(/^req-/, ""));
  if (!Number.isInteger(numericRequestID) || numericRequestID <= 0) {
    throw new Error("Invalid request id.");
  }

  const response = await apiPost(
    `/customer/requests/${numericRequestID}/payments/initiate`,
    {
      provider,
      amountEtb: amountETB,
    }
  );

  return response?.payment || response;
}
