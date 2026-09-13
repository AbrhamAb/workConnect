import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";

export function WorkerProfileHeader({ worker }) {
  const isAvailable = worker?.availability === "Available";

  return (
    <Card className="p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <Avatar
            src={worker?.profileImage}
            alt={worker?.fullName || "Worker"}
            size="2xl"
          />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-[#1A362D]">
                {worker?.fullName || "Worker"}
              </h2>

              {worker?.verified ? (
                <Badge
                  variant="success"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                >
                  VERIFIED
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                >
                  UNVERIFIED
                </Badge>
              )}
            </div>

            <p className="mt-2 text-lg text-gray-500">
              {worker?.primarySkill || "Skilled Professional"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 fill-[#B8860B]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>

                <span className="font-medium">
                  {(worker?.rating ?? 0).toFixed(1)}
                  <span className="text-gray-500">
                    {" "}
                    ({worker?.totalReviews ?? 0} reviews)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 12.414A8 8 0 1116 9a8 8 0 01-2.586 5.914l4.243 4.243z"
                  />
                </svg>

                <span>{worker?.city || "Not specified"}</span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className={`h-4 w-4 ${
                    isAvailable ? "text-emerald-500" : "text-amber-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="5" />
                </svg>

                <span>{worker?.availability || "Unavailable"}</span>
              </div>
            </div>
          </div>
        </div>

        <Button variant="secondary">Change Photo</Button>
      </div>
    </Card>
  );
}
