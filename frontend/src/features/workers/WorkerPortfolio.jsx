import Image from "next/image";

export default function WorkerPortfolio({ portfolio = [] }) {
  const visibleItems = portfolio.slice(0, 3);
  const remainingItems = Math.max(portfolio.length - visibleItems.length, 0);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>

        <span className="text-sm font-medium text-gray-500">
          {portfolio.length} {portfolio.length === 1 ? "project" : "projects"}
        </span>
      </div>

      {/* Empty State */}

      {portfolio.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500">
          No portfolio items yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visibleItems.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <Image
                src={image}
                alt={`Portfolio ${index + 1}`}
                fill
                className="object-cover transition hover:scale-105"
              />
            </div>
          ))}

          {remainingItems > 0 && (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-[#1A362D] text-center text-white transition hover:opacity-90">
              <div>
                <div className="text-2xl font-bold">+{remainingItems}</div>

                <div className="text-sm opacity-90">MORE</div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
