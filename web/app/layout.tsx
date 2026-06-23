import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dookki Live Board – Quản Lý Bàn Thông Minh",
  description: "Hệ thống quản lý bàn thời gian thực cho Dookki Korean Buffet – Hà Nội",
  keywords: ["Dookki", "buffet Hàn Quốc", "quản lý bàn", "thời gian thực"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
