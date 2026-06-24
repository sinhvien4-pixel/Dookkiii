import { v4 as uuidv4 } from "uuid";
import { Branch, Table, Employee, WaitingCustomer, Feedback } from "@/types";

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function makeTables(branchId: string, count: number): Table[] {
  const tables: Table[] = [];
  for (let i = 1; i <= count; i++) {
    const rand = Math.random();
    let status: Table["status"];
    let startTime: string | null = null;
    let guests = 0;

    if (rand < 0.30) {
      status = "available";
    } else if (rand < 0.72) {
      status = "occupied";
      guests = Math.floor(Math.random() * 4) + 1;
      startTime = minutesAgo(Math.floor(Math.random() * 78) + 5);
    } else if (rand < 0.88) {
      status = "cleaning";
    } else {
      status = "reserved";
    }

    tables.push({
      id: uuidv4(),
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
    id: uuidv4(),
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
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    branchId,
    name: names[i % names.length],
    partySize: Math.floor(Math.random() * 4) + 1,
    joinedAt: minutesAgo(Math.floor(Math.random() * 28) + 2),
    phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
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

  branches.forEach((branch) => {
    branch.employees.forEach((emp) => {
      const count = Math.floor(Math.random() * 6) + 3;
      for (let i = 0; i < count; i++) {
        const rating = Math.random() < 0.6
          ? Math.floor(Math.random() * 2) + 4
          : Math.floor(Math.random() * 3) + 1;
        feedbacks.push({
          id: uuidv4(),
          branchId: branch.id,
          branchName: branch.name,
          employeeId: emp.id,
          employeeName: emp.name,
          rating,
          comment: DEMO_COMMENTS[Math.floor(Math.random() * DEMO_COMMENTS.length)],
          createdAt: minutesAgo(Math.floor(Math.random() * 1440) + 10),
          customerName: DEMO_CUSTOMERS[Math.floor(Math.random() * DEMO_CUSTOMERS.length)],
        });

        emp.totalRating += rating;
        emp.feedbackCount += 1;
      }
    });
  });

  return feedbacks;
}
