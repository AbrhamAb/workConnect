import Link from "next/link";

import { Card } from "./card";
import { Button } from "./button";
import { Avatar } from "./avatar";

export function WorkerRequestCard({
  id,
  name,
  location,
  avatar,
  price,
  priceType,
  description,
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        {/* Client Info */}
        <div className="flex items-center gap-3">
          <Avatar src={avatar} size="md" />

          <div>
            <h4 className="font-bold text-gray-900">{name}</h4>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              {location}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-right">
          <div className="font-bold text-gray-900">{price}</div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {priceType}
          </div>
        </div>
      </div>

      <p className="leading-relaxed text-sm text-gray-600">
        &quot;{description}&quot;
      </p>

      {/* Action */}
      <Link href={`/worker/requests/${id}`} className="mt-2">
        <Button variant="primary" fullWidth className="gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H9m0 0l3-3m-3 3l3 3m9-3A9 9 0 113 12a9 9 0 0118 0z"
            />
          </svg>
          View Request
        </Button>
      </Link>
    </Card>
  );
}
