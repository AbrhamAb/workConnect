import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function DangerZoneCard() {
  return (
    <Card className="border-red-200 p-6">
      <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>

      <p className="mt-2 text-gray-500">
        Permanently deleting your account will remove your profile, portfolio,
        request history, and all associated data. This action cannot be undone.
      </p>

      <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="font-semibold text-red-700">Delete Account</h4>

            <p className="mt-1 text-sm text-red-600">
              This action is permanent.
            </p>
          </div>

          <Button className="border border-red-600 bg-red-600 text-red-600 hover:bg-red-400">
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );
}
