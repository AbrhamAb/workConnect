import { Button } from "./button";

export function HeroSearch() {
  return (
    <div className="relative bg-[#274f42] rounded-2xl overflow-hidden py-20 px-6 text-center shadow-xl my-4">
      {/* Background tint overlay matching Figma asset style */}
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Discover skilled hands for every task.
        </h1>

        {/* Dual Input Search Bar Container */}
        <div className="bg-white p-2 rounded-xl md:rounded-full shadow-lg flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
          {/* Service Input */}
          <div className="w-full flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="What service do you need?"
              className="w-full text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Location Input */}
          <div className="w-full flex items-center gap-3 px-4 py-2">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
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
            <input
              type="text"
              placeholder="Location"
              className="w-full text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Action Trigger */}
          <Button
            variant="primary"
            className="w-full md:w-auto rounded-lg md:rounded-full px-8 h-11 bg-[#1A362D]"
          >
            Search
          </Button>
        </div>

        <p className="text-sm text-white/80 font-medium tracking-wide">
          Trusted by 10,000+ customers in Ethiopia and beyond.
        </p>
      </div>
    </div>
  );
}
