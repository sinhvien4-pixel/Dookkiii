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

export interface BranchStats {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  cleaningTables: number;
  reservedTables: number;
  waitingCount: number;
  estimatedWaitMinutes: number;
  occupancyRate: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface BranchWithDistance extends Branch {
  distanceKm: number;
}
