import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { Table } from "@/types";

function patchAndSave(branchId: string, tableId: string, patch: Partial<Table>) {
  const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
  if (!branch) return;

  const updated = {
    ...branch,
    tables: branch.tables.map((t) =>
      t.id !== tableId ? t : { ...t, ...patch }
    ),
  };
  setDoc(doc(getDb(), "branches", branchId), updated);
}

export const tableService = {
  startTable(branchId: string, tableId: string, guests: number) {
    patchAndSave(branchId, tableId, {
      status: "occupied",
      guests,
      startTime: new Date().toISOString(),
    });
  },

  endTable(branchId: string, tableId: string) {
    patchAndSave(branchId, tableId, { status: "cleaning", guests: 0, startTime: null });
  },

  setCleaning(branchId: string, tableId: string) {
    patchAndSave(branchId, tableId, { status: "cleaning", guests: 0, startTime: null });
  },

  setAvailable(branchId: string, tableId: string) {
    patchAndSave(branchId, tableId, { status: "available", guests: 0, startTime: null });
  },

  adjustTime(branchId: string, tableId: string, deltaMinutes: number) {
    const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
    const table = branch?.tables.find((t) => t.id === tableId);
    if (!table) return;
    patchAndSave(branchId, tableId, {
      maxDiningMinutes: Math.max(10, table.maxDiningMinutes + deltaMinutes),
    });
  },

  setCustomTime(branchId: string, tableId: string, totalMinutes: number) {
    patchAndSave(branchId, tableId, { maxDiningMinutes: Math.max(10, totalMinutes) });
  },
};
