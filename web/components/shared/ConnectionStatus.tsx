"use client";

import { Wifi } from "lucide-react";

export function ConnectionStatus() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
      <Wifi className="w-3 h-3" />
      <span>Trực tuyến</span>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
    </div>
  );
}
