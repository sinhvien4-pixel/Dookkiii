import { cn } from "@/lib/utils";
import { TableStatus } from "@/types";

const CONFIG: Record<TableStatus, { label: string; className: string; dot: string }> = {
  available: {
    label: "Trống",
    className: "bg-green-500/20 text-green-400 border border-green-500/40",
    dot: "bg-green-400",
  },
  occupied: {
    label: "Đang sử dụng",
    className: "bg-red-500/20 text-red-400 border border-red-500/40",
    dot: "bg-red-400",
  },
  cleaning: {
    label: "Đang dọn dẹp",
    className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
    dot: "bg-yellow-400",
  },
};

interface Props {
  status: TableStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TableStatusBadge({ status, size = "md", className }: Props) {
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        cfg.className,
        className
      )}
    >
      <span className={cn("rounded-full", cfg.dot, size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5")} />
      {cfg.label}
    </span>
  );
}
