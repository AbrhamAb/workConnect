import Link from "next/link";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function PortfolioCard({ portfolioCount = 0 }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A362D]">Portfolio</h3>

          <p className="mt-2 max-w-2xl text-gray-500">
            Showcase your previous work to help customers trust your skills.
            Upload photos of completed projects and organize your portfolio in
            one place.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#E8F5F1] px-3 py-1 text-sm font-medium text-[#1A362D]">
              {portfolioCount} Photo{portfolioCount === 1 ? "" : "s"}
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {portfolioCount > 0 ? "Ready to share" : "Not set up yet"}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Link href="/worker/portfolio">
            <Button variant="primary">Manage Portfolio</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
