import { useAppStore } from "@/store/appStore";
import { Branch, Table } from "@/types";

function applyPatch(
  branches: Branch[],
  branchId: string,
  tableId: string,
  patch: Partial<Table>
): Branch[] {
  return branches.map((b) =>
    b.id !== branchId
      ? b
      : { ...b, tables: b.tables.map((t) => (t.id !== tableId ? t : { ...t, ...patch })) }
  );
}

function commit(branchId: string, tableId: string, patch: Partial<Table>) {
  const store = useAppStore.getState();
  store.setBranches(applyPatch(store.branches, branchId, tableId, patch));
}

export const tableService = {
  startTable(branchId: string, tableId: string, guests: number) {
    commit(branchId, tableId, {
      status: "occupied",
      guests,
      startTime: new Date().toISOString(),
    });
  },

  endTable(branchId: string, tableId: string) {
    commit(branchId, tableId, { status: "cleaning", guests: 0, startTime: null });
  },

  setCleaning(branchId: string, tableId: string) {
    commit(branchId, tableId, { status: "cleaning", guests: 0, startTime: null });
  },

  setAvailable(branchId: string, tableId: string) {
    commit(branchId, tableId, { status: "available", guests: 0, startTime: null });
  },

  adjustTime(branchId: string, tableId: string, deltaMinutes: number) {
    const { branches } = useAppStore.getState();
    const table = branches.find((b) => b.id === branchId)?.tables.find((t) => t.id === tableId);
    if (!table) return;
    commit(branchId, tableId, {
      maxDiningMinutes: Math.max(10, table.maxDiningMinutes + deltaMinutes),
    });
  },

  setCustomTime(branchId: string, tableId: string, totalMinutes: number) {
    commit(branchId, tableId, { maxDiningMinutes: Math.max(10, totalMinutes) });
  },
};
