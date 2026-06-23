"use client";

import { useEffect } from "react";
import { branchService } from "@/services/branchService";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    branchService.initialize();
  }, []);

  return <>{children}</>;
}
