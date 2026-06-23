"use client";

import { useAppStore } from "@/store/appStore";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const isConnected = useAppStore((s) => s.isConnected);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isConnected
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Đang kết nối</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Mất kết nối</span>
        </>
      )}
    </div>
  );
}
