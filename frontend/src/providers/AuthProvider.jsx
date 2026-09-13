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

    window.addEventListener("workconnect-auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("workconnect-auth-expired", handleAuthExpired);
    };
  }, [initialize]);

  return children;
}
