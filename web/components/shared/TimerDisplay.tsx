"use client";

import { useTableTimer } from "@/hooks/useTableTimer";
import { Table } from "@/types";
import { getTimerColor, getTimerBg } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  table: Table;
  compact?: boolean;
}

export function TimerDisplay({ table, compact = false }: Props) {
  const { remaining, elapsed } = useTableTimer(table);

  if (table.status !== "occupied" || !table.startTime) return null;

  const pct = Math.min(100, (elapsed / table.maxDiningMinutes) * 100);
  const color = getTimerColor(remaining);
  const barColor = getTimerBg(remaining);

  if (compact) {
    return (
      <div className={cn("text-xs font-bold", color)}>
        Còn {remaining} phút
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-white/60">
        <span>Đã dùng: {elapsed} phút</span>
        <span className={cn("font-bold", color)}>Còn {remaining} phút</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
