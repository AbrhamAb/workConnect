"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();

    const handler = () => initialize();
    window.addEventListener("workconnect:authChanged", handler);

    return () => window.removeEventListener("workconnect:authChanged", handler);
  }, [initialize]);

  return children;
}
