import { Card } from "@/components/card";

export function AchievementsCard({ achievements = [] }) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1A362D]">Achievements</h2>

      <p className="mt-1 text-sm text-gray-500">
        Milestones you have earned as a trusted worker.
      </p>

      <div className="mt-6 space-y-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className="flex gap-4 rounded-xl border border-gray-100 p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F1] text-xl">
              {achievement.icon}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {achievement.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
