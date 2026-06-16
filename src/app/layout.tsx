import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人技术品牌网站",
  description: "集极客美学与高信息密度于一体的个人全栈数字空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
