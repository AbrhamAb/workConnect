"use client";

import { useEffect } from "react";

import { initializeDatabase } from "@/mock/initialize";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeDatabase();
    initialize();
  }, [initialize]);

  useEffect(() => {
    function handleAuthExpired() {
      initialize();
    }

    function handleUserUpdated() {
      initialize();
    }

    window.addEventListener("workconnect-auth-expired", handleAuthExpired);
    window.addEventListener("workconnect-user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener("workconnect-auth-expired", handleAuthExpired);
      window.removeEventListener("workconnect-user-updated", handleUserUpdated);
    };
  }, [initialize]);

  return children;
}
