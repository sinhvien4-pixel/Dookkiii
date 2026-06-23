import { Branch, Feedback, Table, WaitingCustomer } from "../types";
import { generateInitialBranches } from "./mockData";
import { v4 as uuidv4 } from "uuid";

class DataStore {
  private branches: Branch[] = [];
  private feedbacks: Feedback[] = [];

  constructor() {
    this.branches = generateInitialBranches();
  }

  getBranches(): Branch[] {
    return this.branches;
  }

  getBranch(branchId: string): Branch | undefined {
    return this.branches.find((b) => b.id === branchId);
  }

  getTable(branchId: string, tableId: string): Table | undefined {
    const branch = this.getBranch(branchId);
    return branch?.tables.find((t) => t.id === tableId);
  }

  startTable(branchId: string, tableId: string, guests: number): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.status = "occupied";
    table.guests = guests;
    table.startTime = new Date().toISOString();
    table.maxDiningMinutes = 90;
    return branch;
  }

  endTable(branchId: string, tableId: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.status = "cleaning";
    table.guests = 0;
    table.startTime = null;
    return branch;
  }

  setTableCleaning(branchId: string, tableId: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.status = "cleaning";
    table.guests = 0;
    table.startTime = null;
    return branch;
  }

  setTableAvailable(branchId: string, tableId: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.status = "available";
    table.guests = 0;
    table.startTime = null;
    return branch;
  }

  setTableReserved(branchId: string, tableId: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.status = "reserved";
    return branch;
  }

  adjustTableTime(branchId: string, tableId: string, minutes: number): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table || !table.startTime) return null;
    const start = new Date(table.startTime).getTime();
    const adjusted = start - minutes * 60 * 1000;
    table.startTime = new Date(adjusted).toISOString();
    return branch;
  }

  setTableCustomTime(branchId: string, tableId: string, totalMinutes: number): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const table = branch.tables.find((t) => t.id === tableId);
    if (!table) return null;
    table.maxDiningMinutes = totalMinutes;
    return branch;
  }

  addToQueue(branchId: string, name: string, partySize: number, phone: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const customer: WaitingCustomer = {
      id: uuidv4(),
      branchId,
      name,
      partySize,
      joinedAt: new Date().toISOString(),
      phone,
    };
    branch.waitingQueue.push(customer);
    return branch;
  }

  removeFromQueue(branchId: string, customerId: string): Branch | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    branch.waitingQueue = branch.waitingQueue.filter((c) => c.id !== customerId);
    return branch;
  }

  addFeedback(
    branchId: string,
    employeeId: string,
    rating: number,
    comment: string,
    customerName: string
  ): Feedback | null {
    const branch = this.getBranch(branchId);
    if (!branch) return null;
    const employee = branch.employees.find((e) => e.id === employeeId);
    if (!employee) return null;

    employee.totalRating += rating;
    employee.feedbackCount += 1;

    const feedback: Feedback = {
      id: uuidv4(),
      branchId,
      branchName: branch.name,
      employeeId,
      employeeName: employee.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      customerName,
    };
    this.feedbacks.push(feedback);
    return feedback;
  }

  getFeedbacks(): Feedback[] {
    return this.feedbacks;
  }
}

export const store = new DataStore();
