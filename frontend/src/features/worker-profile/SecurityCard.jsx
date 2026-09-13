"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { useAuthStore } from "@/store/authStore";

export function SecurityCard() {
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  async function handleLogout() {
    try {
      await logout();

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-[#1A362D]">Security</h3>

      <p className="mt-2 text-gray-500">
        Manage your password and account security.
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <h4 className="font-semibold text-gray-900">Password</h4>

            <p className="mt-1 text-sm text-gray-500">
              Last changed 2 months ago
            </p>
          </div>

          <Button variant="secondary">Change Password</Button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <h4 className="font-semibold text-gray-900">Sign Out</h4>

            <p className="mt-1 text-sm text-gray-500">
              Sign out from your current device.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
