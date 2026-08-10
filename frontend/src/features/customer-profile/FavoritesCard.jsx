import Link from "next/link";

import { Card } from "@/components/card";
import { Avatar } from "@/components/avatar";

export default function FavoritesCard({ workers = [] }) {
  return (
    <Card>
      <div className="space-y-5">
        {/* Header */}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A362D]">Favorite Workers</h2>

          {workers.length > 0 && (
            <span className="text-sm font-medium text-gray-500">
              {workers.length} Saved
            </span>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {workers.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-6 text-center">
            <svg
              className="mx-auto h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>

            <p className="mt-3 text-sm text-gray-500">
              You have not saved any workers yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={worker.avatar} alt={worker.name} size="sm" />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {worker.name}
                    </h3>

                    <p className="text-sm text-gray-500">{worker.profession}</p>

                    <p className="mt-1 text-xs text-amber-600">
                      ★ {worker.rating}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/customer/workers/${worker.id}`}
                  className="rounded-lg bg-[#E8F5F1] px-3 py-2 text-sm font-semibold text-[#1A362D] transition hover:opacity-90"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
