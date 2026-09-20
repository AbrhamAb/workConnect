import { Avatar } from "@/components/avatar";

export default function WorkerSummaryCard({ worker }) {
  return (
    <section className="rounded-xl bg-gray-50 p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}

        <Avatar
          src={worker.image}
          alt={worker.name}
          size="lg"
          className="h-20 w-20"
        />

        {/* Info */}

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{worker.name}</h2>

          <p className="mt-1 text-gray-500">{worker.title}</p>

          {/* Badges */}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
              {worker.badge}
            </span>

            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>

              <span className="font-medium">
                {Number(worker.rating).toFixed(1)}
              </span>

              <span className="text-gray-500">
                ({worker.reviewCount}{" "}
                {worker.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        </div>

        {/* Verification */}

        <div className="hidden sm:flex">
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Verified
          </div>
        </div>
      </div>
    </section>
  );
}
