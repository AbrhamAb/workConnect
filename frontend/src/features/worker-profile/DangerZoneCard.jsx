"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { useAuthStore } from "@/store/authStore";

export function DangerZoneCard() {
  const router = useRouter();
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isLoading = useAuthStore((state) => state.isLoading);

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently deactivate your account. This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAccount();
      router.replace("/login");
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert(error.message || "Unable to delete account right now.");
    }
  }

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

          <Button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="border border-red-600 bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
