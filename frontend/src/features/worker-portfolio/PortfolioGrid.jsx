import { PortfolioImageCard } from "./PortfolioImageCard";
import { EmptyPortfolioState } from "./EmptyPortfolioState";

export function PortfolioGrid({ items = [], onDelete }) {
  if (items.length === 0) {
    return <EmptyPortfolioState />;
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-[#1A362D]">My Portfolio</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PortfolioImageCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
