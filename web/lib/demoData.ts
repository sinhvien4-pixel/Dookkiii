import { v4 as uuidv4 } from "uuid";
import { Branch, Table, Employee, WaitingCustomer, Feedback } from "@/types";

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function makeTables(branchId: string, count: number): Table[] {
  const pattern: Table["status"][] = [
    "available", "occupied", "occupied", "cleaning",
    "occupied", "available", "occupied", "occupied",
    "available", "occupied", "cleaning", "occupied",
    "occupied", "available", "occupied", "cleaning",
    "available", "occupied", "occupied", "occupied",
  ];
  const guestsPattern = [0, 3, 2, 0, 4, 0, 1, 3, 0, 2, 0, 4, 3, 0, 2, 0, 0, 1, 3, 2];
  const elapsedPattern = [0, 25, 55, 0, 10, 0, 70, 40, 0, 60, 0, 15, 35, 0, 50, 0, 0, 80, 20, 45];

  const tables: Table[] = [];
  for (let i = 1; i <= count; i++) {
    const idx = (i - 1) % pattern.length;
    const status = pattern[idx];
    const guests = status === "occupied" ? guestsPattern[idx] || 2 : 0;
    const startTime = status === "occupied" ? minutesAgo(elapsedPattern[idx] || 30) : null;

    tables.push({
      id: `${branchId}-table-${i}`,
      branchId,
      number: i,
      status,
      guests,
      maxDiningMinutes: 90,
      startTime,
      note: "",
    });
  }
  return tables;
}

function makeEmployees(branchId: string, names: string[]): Employee[] {
  const positions = ["Phục vụ bàn", "Thu ngân", "Quản lý ca", "Bếp trưởng", "Phụ bếp"];
  return names.map((name, i) => ({
    id: `${branchId}-emp-${i}`,
    branchId,
    name,
    position: positions[i % positions.length],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    totalRating: 0,
    feedbackCount: 0,
  }));
}

function makeQueue(branchId: string, count: number): WaitingCustomer[] {
  const names = ["Anh Minh", "Chị Lan", "Anh Tuấn", "Chị Hoa", "Anh Đức", "Chị Mai", "Anh Hùng", "Chị Thu"];
  const partySizes = [2, 4, 1, 3, 2, 4, 3, 1];
  const waitMins = [5, 12, 3, 18, 8, 22, 10, 15];
  return Array.from({ length: count }, (_, i) => ({
    id: `${branchId}-queue-${i}`,
    branchId,
    name: names[i % names.length],
    partySize: partySizes[i % partySizes.length],
    joinedAt: minutesAgo(waitMins[i % waitMins.length]),
    phone: `090${1000000 + i}`,
  }));
}

const BRANCH_CONFIGS = [
  {
    id: "royal-city",
    name: "Dookki Royal City",
    address: "72 Nguyễn Trãi, Thanh Xuân",
    district: "Thanh Xuân",
    totalTables: 12,
    coordinates: { lat: 20.9955, lng: 105.8126 },
    phone: "024 3568 7890",
    imageUrl: "https://emdoi.vn/wp-content/uploads/2025/04/Dookki-Smart-City-7.webp",
    employeeNames: ["Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Hoa", "Phạm Văn Đức", "Hoàng Thị Mai"],
    queueCount: 4,
  },
  {
    id: "times-city",
    name: "Dookki Times City",
    address: "458 Minh Khai, Hai Bà Trưng",
    district: "Hai Bà Trưng",
    totalTables: 18,
    coordinates: { lat: 20.9998, lng: 105.8597 },
    phone: "024 3567 1234",
    imageUrl: "https://halotravel.vn/wp-content/uploads/2020/04/dookki-ha-noi-3.jpg",
    employeeNames: ["Vũ Thị Thu", "Ngô Văn Hùng", "Bùi Thị Linh", "Đỗ Văn Tú", "Lý Thị Nga", "Trịnh Văn Long"],
    queueCount: 7,
  },
  {
    id: "tran-duy-hung",
    name: "Dookki Trần Duy Hưng",
    address: "119 Trần Duy Hưng, Cầu Giấy",
    district: "Cầu Giấy",
    totalTables: 15,
    coordinates: { lat: 21.0136, lng: 105.7989 },
    phone: "024 3566 5678",
    imageUrl: "https://kenhhomestay.com/wp-content/uploads/2021/03/dookki-14.jpg",
    employeeNames: ["Mai Văn An", "Phạm Thị Bích", "Lê Văn Cường", "Nguyễn Thị Dung", "Trần Văn Em"],
    queueCount: 2,
  },
  {
    id: "skylake",
    name: "Dookki Skylake",
    address: "Phạm Hùng, Nam Từ Liêm",
    district: "Nam Từ Liêm",
    totalTables: 10,
    coordinates: { lat: 21.0237, lng: 105.7849 },
    phone: "024 3565 9012",
    imageUrl: "https://dookkivietnam.vn/wp-content/uploads/2025/03/gia-ve-menu-dookki-vietnam.jpg",
    employeeNames: ["Hoàng Văn Phú", "Đặng Thị Quỳnh", "Vương Văn Sơn", "Phan Thị Tâm"],
    queueCount: 0,
  },
  {
    id: "pham-ngoc-thach",
    name: "Dookki Phạm Ngọc Thạch",
    address: "2 Phạm Ngọc Thạch, Đống Đa",
    district: "Đống Đa",
    totalTables: 14,
    coordinates: { lat: 21.0225, lng: 105.8409 },
    phone: "024 3564 3456",
    imageUrl: "https://emdoi.vn/wp-content/uploads/2025/04/Dookki-Smart-City-7.webp",
    employeeNames: ["Nguyễn Văn Uy", "Lê Thị Vân", "Trần Văn Xuân", "Phạm Thị Yến", "Hoàng Văn Zin"],
    queueCount: 3,
  },
  {
    id: "mac-plaza",
    name: "Dookki MAC Plaza",
    address: "10 Trần Phú, Hà Đông",
    district: "Hà Đông",
    totalTables: 11,
    coordinates: { lat: 20.9607, lng: 105.7752 },
    phone: "024 3563 7890",
    imageUrl: "https://halotravel.vn/wp-content/uploads/2020/04/dookki-ha-noi-3.jpg",
    employeeNames: ["Đỗ Thị Ánh", "Ngô Văn Bình", "Bùi Thị Chi", "Lý Văn Dương"],
    queueCount: 1,
  },
  {
    id: "aeon-mall-ha-dong",
    name: "Dookki Aeon Mall Hà Đông",
    address: "Đường Dương Nội, Hà Đông",
    district: "Hà Đông",
    totalTables: 20,
    coordinates: { lat: 20.9714, lng: 105.7611 },
    phone: "024 3562 1234",
    imageUrl: "https://kenhhomestay.com/wp-content/uploads/2021/03/dookki-14.jpg",
    employeeNames: ["Trịnh Thị Em", "Mai Văn Phong", "Phạm Thị Giang", "Lê Văn Hiếu", "Nguyễn Thị Iris", "Trần Văn Khánh"],
    queueCount: 9,
  },
  {
    id: "smart-city",
    name: "Dookki Smart City",
    address: "Khu đô thị Tây Mỗ, Nam Từ Liêm",
    district: "Nam Từ Liêm",
    totalTables: 16,
    coordinates: { lat: 21.0373, lng: 105.7479 },
    phone: "024 3561 5678",
    imageUrl: "https://emdoi.vn/wp-content/uploads/2025/04/Dookki-Smart-City-7.webp",
    employeeNames: ["Vũ Văn Long", "Đặng Thị Mai", "Vương Văn Nam", "Phan Thị Oanh", "Hoàng Văn Phát"],
    queueCount: 5,
  },
] as const;

export function generateDemoBranches(): Branch[] {
  return BRANCH_CONFIGS.map((cfg) => ({
    id: cfg.id,
    name: cfg.name,
    address: cfg.address,
    district: cfg.district,
    totalTables: cfg.totalTables,
    coordinates: cfg.coordinates,
    phone: cfg.phone,
    openHours: "10:00 - 22:00",
    imageUrl: cfg.imageUrl,
    tables: makeTables(cfg.id, cfg.totalTables),
    employees: makeEmployees(cfg.id, [...cfg.employeeNames]),
    waitingQueue: makeQueue(cfg.id, cfg.queueCount),
  }));
}

const DEMO_COMMENTS = [
  "Phục vụ rất tốt",
  "Nhiệt tình và thân thiện",
  "Hỗ trợ rất chu đáo",
  "Nhanh nhẹn, chuyên nghiệp",
  "Sẽ quay lại lần sau",
  "Xuất sắc!",
  "Dịch vụ tuyệt vời",
  "Nhân viên dễ mến",
];
const DEMO_CUSTOMERS = ["Anh Nam", "Chị Hương", "Anh Tuấn", "Chị Linh", "Khách ẩn danh"];

export function generateDemoFeedbacks(branches: Branch[]): Feedback[] {
  const feedbacks: Feedback[] = [];
  const ratings = [5, 4, 5, 3, 4, 5, 4, 2, 5, 4];
  const mins = [15, 45, 90, 180, 300, 30, 120, 60, 240, 10];
  let idx = 0;

  branches.forEach((branch) => {
    branch.employees.forEach((emp, empIdx) => {
      const count = 3 + (empIdx % 3);
      for (let i = 0; i < count; i++) {
        const rating = ratings[idx % ratings.length];
        feedbacks.push({
          id: `fb-${branch.id}-${emp.id}-${i}`,
          branchId: branch.id,
          branchName: branch.name,
          employeeId: emp.id,
          employeeName: emp.name,
          rating,
          comment: DEMO_COMMENTS[idx % DEMO_COMMENTS.length],
          createdAt: minutesAgo(mins[idx % mins.length]),
          customerName: DEMO_CUSTOMERS[idx % DEMO_CUSTOMERS.length],
        });

        emp.totalRating += rating;
        emp.feedbackCount += 1;
        idx++;
      }
    });
  });

  return feedbacks;
}
