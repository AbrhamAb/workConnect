import { Card } from "@/components/card";

export default function RequestDescription({ description }) {
  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1A362D]">Issue Description</h2>

        <div className="h-px bg-gray-100" />

        <p className="leading-8 text-gray-700">{description}</p>
      </div>
    </Card>
  );
}
