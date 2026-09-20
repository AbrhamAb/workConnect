import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/badge";

export default function ReliabilityCard({ worker }) {
  const rating = Number(worker?.rating || 0);
  const progress = Math.min(100, Math.round(rating * 20));

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-[#1A362D] via-[#152D25] to-[#0F201A] text-white p-6 shadow-xl ring-1 ring-white/10 transition-all duration-300 hover:shadow-2xl">
      {/* Decorative ambient background blur glow */}
      <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-wider text-emerald-100/90">
            Worker Reliability
          </h3>

          <Badge className="bg-[#B8860B] text-black font-bold shadow-sm px-3 py-1 tracking-wide">
            TOP RATED
          </Badge>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-5xl font-black tracking-tight text-white drop-shadow-sm">
              {progress}%
            </p>

            <p className="mt-1.5 text-sm font-medium text-emerald-200/80">
              Customer Satisfaction
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar
            progress={progress}
            colorClass="bg-[#B8860B] shadow-[0_0_12px_rgba(184,134,11,0.4)]"
            trackClass="bg-white/10"
          />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-emerald-100/80 font-normal">
          Your current rating is{" "}
          <span className="font-bold text-white">{rating.toFixed(1)}</span> out
          of 5. Continue responding quickly and completing jobs on time to
          maintain your standing.
        </p>
      </div>

      {/* Decorative Background Icon with hover movement */}
      <svg
        className="absolute -right-8 -bottom-8 h-44 w-44 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    </Card>
  );
}
