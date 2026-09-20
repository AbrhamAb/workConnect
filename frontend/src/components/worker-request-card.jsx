import Link from "next/link";
import { Card } from "./card";
import { Button } from "./button";

export function WorkerRequestCard({
  id,
  name,
  location,
  price,
  priceType,
  description,
}) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Card className="group relative flex flex-col gap-5 overflow-hidden bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-[#1A362D]/20">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1A362D] via-emerald-600 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        {/* Client Info Block */}
        <div className="flex items-center gap-3.5">
          {/* Stylized Monogram Badge replacing missing photo avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A362D] to-emerald-700 font-bold text-white shadow-sm ring-2 ring-emerald-500/20">
            {initial}
          </div>

          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-gray-900 transition-colors group-hover:text-[#1A362D]">
              {name}
            </h4>

            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-emerald-600/80"
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
              <span className="truncate max-w-[160px]">{location}</span>
            </div>
          </div>
        </div>

        {/* Price Tag Badge */}
        <div className="flex shrink-0 flex-col items-end justify-center rounded-2xl bg-gradient-to-br from-[#F4F9F7] to-[#E8F5F1] px-4 py-2 border border-[#1A362D]/10 shadow-sm">
          <div className="text-lg font-black tracking-tight text-[#1A362D]">
            {price}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80">
            {priceType}
          </div>
        </div>
      </div>

      {/* Description Block with Quote Watermark */}
      <div className="relative rounded-xl bg-gray-50/80 p-4 border border-gray-100">
        <svg
          className="absolute right-3 top-3 h-7 w-7 text-gray-200/60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>

        <p className="relative z-10 text-sm leading-relaxed text-gray-600 line-clamp-2">
          <span className="font-serif text-lg font-bold text-emerald-500 leading-none mr-1">
            &quot;
          </span>
          {description}
          <span className="font-serif text-lg font-bold text-emerald-500 leading-none ml-1">
            &quot;
          </span>
        </p>
      </div>

      {/* Action Button */}
      <Link href={`/worker/requests/${id}`} className="mt-1 block">
        <Button
          variant="primary"
          fullWidth
          className="gap-2 rounded-xl bg-[#1A362D] py-3.5 text-white font-bold transition-all duration-300 hover:bg-[#E8F5F1] hover:text-[#1A362D] shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 12H9m0 0l3-3m-3 3l3 3m9-3A9 9 0 113 12a9 9 0 0118 0z"
            />
          </svg>
          View Request
        </Button>
      </Link>
    </Card>
  );
}
