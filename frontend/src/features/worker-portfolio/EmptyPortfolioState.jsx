import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function EmptyPortfolioState() {
  return (
    <Card className="py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5F1]">
          <svg
            className="h-10 w-10 text-[#1A362D]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4-4a2 2 0 012.828 0L16 17m-2-2l1-1a2 2 0 012.828 0L20 16M6 8h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-[#1A362D]">
          No Portfolio Photos Yet
        </h2>

        <p className="mt-3 max-w-md text-gray-500">
          Upload photos of your completed work so customers can better
          understand your experience and craftsmanship.
        </p>

        <Button className="mt-8">Upload First Photo</Button>
      </div>
    </Card>
  );
}
