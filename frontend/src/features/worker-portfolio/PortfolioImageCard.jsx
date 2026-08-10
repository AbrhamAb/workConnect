import Image from "next/image";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function PortfolioImageCard({ item, onDelete }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-square">
        <Image
          src={item.image}
          alt={item.title || "Portfolio work"}
          fill
          className="object-cover"
        />
      </div>

      <div className="border-t border-gray-100 p-4">
        <Button
          variant="secondary"
          fullWidth
          className="border border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => onDelete?.(item.id)}
        >
          Delete Photo
        </Button>
      </div>
    </Card>
  );
}
