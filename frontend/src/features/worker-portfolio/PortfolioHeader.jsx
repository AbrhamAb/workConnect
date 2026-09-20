export function PortfolioHeader({ totalItems = 0 }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A362D]">
          Portfolio
        </h1>

        <p className="mt-2 max-w-2xl text-gray-500">
          Showcase your completed work by uploading photos. Customers can view
          your previous work before hiring you.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-[#E8F5F1] px-4 py-3">
        <p className="text-sm font-semibold text-[#1A362D]">Portfolio Photos</p>

        <p className="text-2xl font-bold text-[#1A362D]">{totalItems}</p>
      </div>
    </section>
  );
}
