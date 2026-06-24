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
    const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      employees: [...branch.employees, { ...employee, branchId }],
    };
    setDoc(doc(getDb(), "branches", branchId), updated);
  },

  removeEmployee(branchId: string, employeeId: string) {
    const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      employees: branch.employees.filter((e) => e.id !== employeeId),
    };
    setDoc(doc(getDb(), "branches", branchId), updated);
  },
};
