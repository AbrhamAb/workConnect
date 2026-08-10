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

  return children;
}
