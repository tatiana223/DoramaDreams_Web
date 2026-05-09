import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/app/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 text-sm font-bold text-foreground shadow-sm backdrop-blur transition hover:border-violet-300 hover:bg-accent dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}
