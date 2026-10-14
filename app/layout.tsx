import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext"; // <-- Kéo CartProvider vào

export const metadata = {
  title: "CIOs Camera - Thiết Bị An Ninh & Nhà Thông Minh Cao Cấp",
  description: "Cung cấp giải pháp an ninh, camera quan sát AI 4.0, thiết bị mạng router switch toàn diện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Bọc toàn bộ trang web bằng CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}