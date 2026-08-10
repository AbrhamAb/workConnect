import { Card } from "./card";
import { Badge } from "./badge";
import { Avatar } from "./avatar";

export function CustomerRequestCard({
  title,
  date,
  time,
  status,
  workerName,
  workerAvatar,
  rating,
  hasReceipt,
}) {
  // Map our generic status string to the specific Badge variants we built earlier
  const statusVariantMap = {
    ACCEPTED: "success",
    PENDING: "pending",
    COMPLETED: "completed",
  };

  return (
    <Card className="flex flex-row items-center gap-6 p-4 hover:shadow-md transition-shadow">
      {/* Left: Service Icon Placeholder */}
      <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-[#1A362D]">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      {/* Middle: Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-bold text-gray-900 truncate">{title}</h4>
        <div className="flex items-center text-sm text-gray-500 mt-1 gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {date} • {time}
          </span>
        </div>
      </div>

      {/* Right: Dynamic Status Area */}
      <div className="flex flex-col items-end gap-2 w-48 border-r border-gray-100 pr-6">
        <Badge variant={statusVariantMap[status] || "default"}>{status}</Badge>

        {status === "ACCEPTED" && (
          <div className="flex items-center gap-2 mt-1">
            <Avatar src={workerAvatar} size="sm" />
            <span className="text-sm font-medium text-gray-700">
              {workerName}
            </span>
          </div>
        )}

        {status === "PENDING" && (
          <span className="text-sm text-gray-500 mt-1">
            Waiting for response...
          </span>
        )}

        {status === "COMPLETED" && rating && (
          <div className="flex text-[#B8860B] mt-1 gap-0.5">
            {[...Array(rating)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* Far Right Action Icon */}
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        {hasReceipt ? (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
    </Card>
  );
}
