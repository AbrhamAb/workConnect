import Link from "next/link";

export default function RequestActions({ submitting = false }) {
  return (
    <section className="flex flex-wrap items-center gap-4">
      {/* Submit */}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#E8F5F1] px-8 py-3 font-bold text-[#1A362D] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
