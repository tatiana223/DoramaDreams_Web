import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  value: string | number;
  label: string;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  centered?: boolean;
};

export function StatCard({
  value,
  label,
  icon,
  className,
  valueClassName,
  labelClassName,
  centered = true,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-border/60",
        "bg-gradient-to-br from-background/95 via-violet-500/10 to-fuchsia-500/10",
        "shadow-xl shadow-violet-950/10 backdrop-blur-xl",
        "dark:border-white/10 dark:from-white/[0.10] dark:via-violet-400/[0.10] dark:to-fuchsia-400/[0.10]",
        "before:absolute before:-right-8 before:-top-8 before:h-24 before:w-24 before:rounded-full before:bg-white/10 before:blur-2xl",
        "after:absolute after:-left-6 after:-bottom-6 after:h-20 after:w-20 after:rounded-full after:bg-violet-400/10 after:blur-2xl",
        centered ? "flex min-h-28 flex-col items-center justify-center px-4 py-5 text-center" : "px-4 py-5",
        className
      )}
    >
      <div className="relative z-10">
        {icon && (
          <div
            className={cn(
              "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl",
              "bg-background/70 text-violet-700 dark:bg-white/10 dark:text-violet-100"
            )}
          >
            {icon}
          </div>
        )}

        <p
          className={cn(
            "font-mono text-4xl font-black leading-none tabular-nums tracking-tight text-foreground dark:text-white",
            valueClassName
          )}
        >
          {value}
        </p>

        <p
          className={cn(
            "mt-2 text-sm font-black leading-tight text-muted-foreground dark:text-white/55",
            labelClassName
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}