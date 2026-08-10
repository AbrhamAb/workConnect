import { Card } from "@/components/card";

export function VerificationNotice({ worker }) {
  const verified = Boolean(worker?.verified);

  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg
            className="h-6 w-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-900">
            {verified
              ? "Your account is verified"
              : "Your account is not verified"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            {verified
              ? "You are already eligible to receive more visibility and customer trust."
              : "Verified workers receive higher visibility in search results, increased customer trust, and access to more service requests. Submit the required documents below to begin the verification process."}
          </p>
        </div>
      </div>
    </Card>
  );
}
