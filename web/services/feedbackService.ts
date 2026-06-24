import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { Feedback } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const feedbackService = {
  create(data: {
    branchId: string;
    employeeId: string;
    rating: number;
    comment: string;
    customerName: string;
  }) {
    const store = useAppStore.getState();
    const branch = store.branches.find((b) => b.id === data.branchId);
    const employee = branch?.employees.find((e) => e.id === data.employeeId);
    if (!branch || !employee) return;

    const feedbackId = uuidv4();
    const newFeedback: Feedback = {
      id: feedbackId,
      branchId: data.branchId,
      branchName: branch.name,
      employeeId: data.employeeId,
      employeeName: employee.name,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
      customerName: data.customerName,
    };

    const db = getDb();
    setDoc(doc(db, "feedbacks", feedbackId), newFeedback);

    const updatedBranch = {
      ...branch,
      employees: branch.employees.map((e) =>
        e.id !== data.employeeId
          ? e
          : {
              ...e,
              totalRating: e.totalRating + data.rating,
              feedbackCount: e.feedbackCount + 1,
            }
      ),
    };
    setDoc(doc(db, "branches", data.branchId), updatedBranch);
  },

  getAll(): Feedback[] {
    return useAppStore.getState().feedbacks;
  },
};
