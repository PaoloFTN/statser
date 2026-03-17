"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
            {sublabel && (
              <span className="ml-1 text-muted-foreground/80">
                {sublabel}
              </span>
            )}
          </span>
          <span
            className={cn(
              "tabular-nums text-2xl font-bold",
              variant === "highlight" && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {value}
          </span>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onIncrement} className="flex-1">
            +1
          </Button>
          {onDecrement && (
            <Button type="button" variant="outline" onClick={onDecrement}>
              −
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
