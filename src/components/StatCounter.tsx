"use client";

interface StatCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement?: () => void;
  sublabel?: string;
  variant?: "default" | "highlight";
}

export function StatCounter({
  label,
  value,
  onIncrement,
  onDecrement,
  sublabel,
  variant = "default",
}: StatCounterProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
          {sublabel && (
            <span className="ml-1 text-zinc-400 dark:text-zinc-500">
              {sublabel}
            </span>
          )}
        </span>
        <span
          className={`tabular-nums text-2xl font-bold ${
            variant === "highlight"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {value}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onIncrement}
          className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          +1
        </button>
        {onDecrement && (
          <button
            type="button"
            onClick={onDecrement}
            className="rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}
