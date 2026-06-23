export type TableStatus = "available" | "occupied" | "cleaning" | "reserved";

export interface Table {
  id: string;
  branchId: string;
  number: number;
  status: TableStatus;
  guests: number;
  maxDiningMinutes: number;
  startTime: string | null;
  note: string;
}

export interface WaitingCustomer {
  id: string;
  branchId: string;
  name: string;
  partySize: number;
  joinedAt: string;
  phone: string;
}

export interface Employee {
  id: string;
  branchId: string;
  name: string;
  position: string;
  avatar: string;
  totalRating: number;
  feedbackCount: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  district: string;
  totalTables: number;
  coordinates: { lat: number; lng: number };
  tables: Table[];
  waitingQueue: WaitingCustomer[];
  employees: Employee[];
  phone: string;
  openHours: string;
  imageUrl: string;
}

export interface Feedback {
  id: string;
  branchId: string;
  branchName: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
}

export interface SocketStore {
  branches: Branch[];
  feedbacks: Feedback[];
}

// Socket payloads
export interface TableStartPayload {
  branchId: string;
  tableId: string;
  guests: number;
}

export interface TableEndPayload {
  branchId: string;
  tableId: string;
}

export interface TableCleaningPayload {
  branchId: string;
  tableId: string;
}

export interface TableAvailablePayload {
  branchId: string;
  tableId: string;
}

export interface TableTimeAdjustPayload {
  branchId: string;
  tableId: string;
  minutes: number;
}

export interface TableCustomTimePayload {
  branchId: string;
  tableId: string;
  totalMinutes: number;
}

export interface QueueAddPayload {
  branchId: string;
  name: string;
  partySize: number;
  phone: string;
}

export interface QueueRemovePayload {
  branchId: string;
  customerId: string;
}

export interface FeedbackCreatePayload {
  branchId: string;
  employeeId: string;
  rating: number;
  comment: string;
  customerName: string;
}
