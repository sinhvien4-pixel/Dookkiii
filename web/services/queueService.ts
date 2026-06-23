import { useAppStore } from "@/store/appStore";
import { v4 as uuidv4 } from "uuid";

export const queueService = {
  add(branchId: string, name: string, partySize: number, phone: string) {
    const store = useAppStore.getState();
    store.setBranches(
      store.branches.map((b) =>
        b.id !== branchId
          ? b
          : {
              ...b,
              waitingQueue: [
                ...b.waitingQueue,
                { id: uuidv4(), branchId, name, partySize, joinedAt: new Date().toISOString(), phone },
              ],
            }
      )
    );
  },

  remove(branchId: string, customerId: string) {
    const store = useAppStore.getState();
    store.setBranches(
      store.branches.map((b) =>
        b.id !== branchId
          ? b
          : { ...b, waitingQueue: b.waitingQueue.filter((c) => c.id !== customerId) }
      )
    );
  },
};
