"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

export default function RouteGuard({
  children,
  requireGuest = false,
  allowedRoles = [],
}) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const currentRole = String(user?.role || "").toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role || "").toLowerCase());

  useEffect(() => {
    if (isLoading) return;

    // Guest pages (login, register, forgot password)
    if (requireGuest) {
      if (isAuthenticated) {
        if (currentRole === "customer") {
          router.replace("/customer/dashboard");
        } else {
          router.replace("/worker/dashboard");
        }
      }

      return;
    }

    // Protected pages
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Role protected pages
    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(currentRole)) {
      if (currentRole === "customer") {
        router.replace("/customer/dashboard");
      } else {
        router.replace("/worker/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, currentRole, requireGuest, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (requireGuest && isAuthenticated) {
    return null;
  }

  if (!requireGuest && !isAuthenticated) {
    return null;
  }

  if (
    !requireGuest &&
    normalizedAllowedRoles.length > 0 &&
    user &&
    !normalizedAllowedRoles.includes(currentRole)
  ) {
    return null;
  }

  return children;
}
