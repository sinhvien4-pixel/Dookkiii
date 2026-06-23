import { Server, Socket } from "socket.io";
import { store } from "../data/store";
import {
  TableStartPayload,
  TableEndPayload,
  TableCleaningPayload,
  TableAvailablePayload,
  TableTimeAdjustPayload,
  TableCustomTimePayload,
  QueueAddPayload,
  QueueRemovePayload,
  FeedbackCreatePayload,
} from "../types";

export function registerSocketHandlers(io: Server, socket: Socket): void {
  socket.on("table:start", (payload: TableStartPayload) => {
    const branch = store.startTable(payload.branchId, payload.tableId, payload.guests);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:end", (payload: TableEndPayload) => {
    const branch = store.endTable(payload.branchId, payload.tableId);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:cleaning", (payload: TableCleaningPayload) => {
    const branch = store.setTableCleaning(payload.branchId, payload.tableId);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:available", (payload: TableAvailablePayload) => {
    const branch = store.setTableAvailable(payload.branchId, payload.tableId);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:reserved", (payload: TableAvailablePayload) => {
    const branch = store.setTableReserved(payload.branchId, payload.tableId);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:adjust-time", (payload: TableTimeAdjustPayload) => {
    const branch = store.adjustTableTime(payload.branchId, payload.tableId, payload.minutes);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("table:custom-time", (payload: TableCustomTimePayload) => {
    const branch = store.setTableCustomTime(payload.branchId, payload.tableId, payload.totalMinutes);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
    }
  });

  socket.on("queue:add", (payload: QueueAddPayload) => {
    const branch = store.addToQueue(
      payload.branchId,
      payload.name,
      payload.partySize,
      payload.phone
    );
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
      io.emit("queue:update", { branchId: payload.branchId, queue: branch.waitingQueue });
    }
  });

  socket.on("queue:remove", (payload: QueueRemovePayload) => {
    const branch = store.removeFromQueue(payload.branchId, payload.customerId);
    if (branch) {
      io.emit("branch:update", { branchId: payload.branchId, branch });
      io.emit("queue:update", { branchId: payload.branchId, queue: branch.waitingQueue });
    }
  });

  socket.on("feedback:create", (payload: FeedbackCreatePayload) => {
    const feedback = store.addFeedback(
      payload.branchId,
      payload.employeeId,
      payload.rating,
      payload.comment,
      payload.customerName
    );
    if (feedback) {
      const feedbacks = store.getFeedbacks();
      io.emit("feedback:update", { feedbacks });
      const branch = store.getBranch(payload.branchId);
      if (branch) {
        io.emit("branch:update", { branchId: payload.branchId, branch });
      }
    }
  });

  socket.on("request:initial-data", () => {
    socket.emit("initial:data", {
      branches: store.getBranches(),
      feedbacks: store.getFeedbacks(),
    });
  });
}
