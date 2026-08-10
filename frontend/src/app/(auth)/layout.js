"use client";

import RouteGuard from "@/components/auth/RouteGuard";

export default function AuthLayout({ children }) {
  return <RouteGuard requireGuest>{children}</RouteGuard>;
}
