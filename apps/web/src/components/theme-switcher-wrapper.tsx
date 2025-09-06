"use client";

import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./ui/kibo-ui/theme-switcher";

export function ThemeSwitcherWrapper() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeSwitcher
      value={theme as "light" | "dark" | "system"}
      onChange={(newTheme) => setTheme(newTheme)}
    />
  );
}
