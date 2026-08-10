import { Avatar } from "@/components/avatar";

export default function WorkerProfileHeader({ worker, onFavoriteToggle }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:justify-between">
        {/* Left */}

        <div className="flex gap-5">
          {/* Avatar */}

          <div className="relative">
            <Avatar
              src={worker.image}
              alt={worker.name}
              size="lg"
              className="h-28 w-28"
            />

            {worker.verified && (
              <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow">
                ✓
              </div>
            )}
          </div>

          {/* Info */}

          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-[#1A362D]">
                {worker.name}
              </h1>

              <p className="mt-1 text-gray-500">{worker.title}</p>
            </div>

            {/* Rating */}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-500">★</span>

              <span className="font-medium">{worker.rating.toFixed(1)}</span>

              <span className="text-gray-500">
                ({worker.reviewCount} reviews)
              </span>
            </div>

            {/* Location */}

            <div className="flex items-center gap-2 text-gray-500">
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
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              {worker.location}
            </div>

            {/* Skills */}

            <div className="flex flex-wrap gap-2 pt-2">
              {worker.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="flex flex-col items-start gap-4 md:items-end">
          {/* Availability */}

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              worker.available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {worker.available ? "Available" : "Busy"}
          </span>

          {/* Favourite */}

          <button
            type="button"
            onClick={() => onFavoriteToggle(worker.id)}
            aria-label={
              worker.favorite ? "Remove from favorites" : "Add to favorites"
            }
            className={`rounded-xl border p-3 transition ${
              worker.favorite
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={worker.favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
