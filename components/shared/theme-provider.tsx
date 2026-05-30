"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/store/user";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useUser((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeMode]);

  return <>{children}</>;
}
