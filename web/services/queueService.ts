import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { v4 as uuidv4 } from "uuid";

export const queueService = {
  add(branchId: string, name: string, partySize: number, phone: string) {
    const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      waitingQueue: [
        ...branch.waitingQueue,
        {
          id: uuidv4(),
          branchId,
          name,
          partySize,
          joinedAt: new Date().toISOString(),
          phone,
        },
      ],
    };
    setDoc(doc(db, "branches", branchId), updated);
  },

  remove(branchId: string, customerId: string) {
    const branch = useAppStore.getState().branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      waitingQueue: branch.waitingQueue.filter((c) => c.id !== customerId),
    };
    setDoc(doc(db, "branches", branchId), updated);
  },
};
