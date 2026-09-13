import { Card } from "./card";

export function CategoryCard({ label, icon }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center bg-gray-50/60 hover:bg-white border border-gray-100 hover:border-gray-200/80 hover:shadow-md cursor-pointer transition-all duration-200 group rounded-xl">
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 group-hover:text-[#1A362D] group-hover:scale-110 transition-transform duration-200 border border-gray-50">
        {icon}
      </div>
      <span className="mt-4 text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </Card>
  );
}
