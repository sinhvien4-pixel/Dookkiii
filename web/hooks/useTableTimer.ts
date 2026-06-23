"use client";

import { useState, useEffect } from "react";
import { Table } from "@/types";
import { getTableRemainingMinutes, getTableElapsedMinutes } from "@/lib/utils";

export function useTableTimer(table: Table) {
  const [remaining, setRemaining] = useState(() => getTableRemainingMinutes(table));
  const [elapsed, setElapsed] = useState(() => getTableElapsedMinutes(table));

  useEffect(() => {
    if (table.status !== "occupied" || !table.startTime) {
      setRemaining(0);
      setElapsed(0);
      return;
    }

    const update = () => {
      setRemaining(getTableRemainingMinutes(table));
      setElapsed(getTableElapsedMinutes(table));
    };

    update();
    const id = setInterval(update, 10000); // update every 10 seconds
    return () => clearInterval(id);
  }, [table, table.startTime, table.status, table.maxDiningMinutes]);

  return { remaining, elapsed };
}
