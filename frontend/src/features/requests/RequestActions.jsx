import { LoadingSpinner } from "@/components/loadingSpinner";
import Link from "next/link";

export default function RequestActions({ submitting = false }) {
  return (
    <section className="flex flex-wrap items-center gap-4">
      {/* Submit */}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#1A362D] px-8 py-3 font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#E8F5F1] hover:text-[#1A362D] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#1A362D] disabled:hover:text-white"
      >
        {submitting ? "Sending..." : "Send Request"}
      </button>

      {/* Cancel */}

      <Link
        href="/customer/workers"
        className="font-medium text-gray-500 transition hover:text-[#1A362D]"
      >
        Cancel
      </Link>
    </section>
  );
}
