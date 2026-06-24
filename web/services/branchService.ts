import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { Branch, Employee } from "@/types";

export const branchService = {
  getAll(): Branch[] {
    return useAppStore.getState().branches;
  },

  getById(id: string): Branch | null {
    return useAppStore.getState().branches.find((b) => b.id === id) ?? null;
  },

  addEmployee(branchId: string, employee: Employee) {
    const store = useAppStore.getState();
    const branch = store.branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      employees: [...branch.employees, { ...employee, branchId }],
    };

    store.updateBranch(branchId, updated);

    setDoc(doc(getDb(), "branches", branchId), updated).catch((err) =>
      console.error("Failed to save employee add:", err)
    );
  },

  removeEmployee(branchId: string, employeeId: string) {
    const store = useAppStore.getState();
    const branch = store.branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      employees: branch.employees.filter((e) => e.id !== employeeId),
    };

    store.updateBranch(branchId, updated);

    setDoc(doc(getDb(), "branches", branchId), updated).catch((err) =>
      console.error("Failed to save employee remove:", err)
    );
  },
};
