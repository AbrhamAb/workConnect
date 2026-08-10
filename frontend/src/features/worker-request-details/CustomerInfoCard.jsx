import { Avatar } from "@/components/avatar";
import { Card } from "@/components/card";

export default function CustomerInfoCard({ customer, request }) {
  const customerName = customer?.fullName || "Customer";

  const customerCity =
    customer?.city || request?.location || "Location not specified";

  const customerPhone = customer?.phone || "Phone not available";

  const customerEmail = customer?.email || "Email not available";

  return (
    <Card className="space-y-6">
      <div className="flex items-start gap-5">
        <Avatar
          src={customer?.profileImage || "/api/placeholder/150/150"}
          alt={customerName}
          size="lg"
        />

        <div className="flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1A362D]">
                {customerName}
              </h2>

              <p className="mt-1 text-gray-500">
                Customer requesting {request?.title || "service"}
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Customer
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              📍
              <span>{customerCity}</span>
            </div>

            <div className="flex items-center gap-2">
              📞
              <span>{customerPhone}</span>
            </div>

            <div className="flex items-center gap-2">
              📧
              <span>{customerEmail}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-[#1A362D]">{customerCity}</p>

          <p className="mt-1 text-sm text-gray-500">City</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-[#1A362D]">
            {request?.preferredDate || "Not specified"}
          </p>

          <p className="mt-1 text-sm text-gray-500">Preferred Date</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-[#1A362D]">
            {request?.budget
              ? `ETB ${Number(request.budget).toLocaleString("en-US")}`
              : "Negotiable"}
          </p>

          <p className="mt-1 text-sm text-gray-500">Budget</p>
        </div>
      </div>
    </Card>
  );
}
