"use client";

const filters = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Declined", value: "declined" },
  { label: "Cancelled", value: "cancelled" },
];

export default function RequestFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
            activeFilter === filter.value
              ? "border-[#1A362D] bg-[#1A362D] text-white shadow-sm"
              : "border-gray-200 bg-white text-gray-600 hover:border-[#1A362D] hover:text-[#1A362D]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
