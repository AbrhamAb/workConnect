"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { initiatePayment } from "@/services/payment.service";

export default function PaymentCard({ requestId, budget, onPaymentInitiated }) {
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  async function handleInitiatePayment() {
    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      // Extract numeric amount from budget string like "1000 ETB"
      const amount = parseFloat(budget.replace(/[^0-9.-]+/g, "")) || 0;

      if (amount <= 0) {
        setMessage("Invalid budget amount.");
        setMessageType("error");
        return;
      }

      await initiatePayment(requestId, amount);

      setMessage("✓ Payment initiated successfully.");
      setMessageType("success");
      setPaymentInitiated(true);

      await onPaymentInitiated?.();
    } catch (error) {
      setMessage(error.message || "Unable to initiate payment. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#1A362D]">Payment</h3>
          <p className="mt-1 text-sm text-gray-500">
            Initiate payment once the work is confirmed as complete.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Amount</p>
          <p className="text-2xl font-bold text-[#1A362D]">{budget}</p>
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleInitiatePayment}
          disabled={loading || paymentInitiated}
          className="w-full rounded-xl bg-[#1A362D] py-3 font-semibold text-white transition hover:bg-[#0f1f1a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing..." : paymentInitiated ? "Payment Initiated" : "Initiate Payment"}
        </button>
      </div>
    </Card>
  );
}
