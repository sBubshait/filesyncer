import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import DashboardLayout from "./components/DashboardLayout";
import { getOverview } from "./lib/api";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FileSyncer",
  description: "Manage your files anywhere with FileSyncer",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { fileCount, favouriteCount, storage } = await getOverview();
  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <body>
        <DashboardLayout title="FileSyncer" storage={{ total: storage.total, used: storage.used, type: storage.type }} fileCount={fileCount} favouriteCount={favouriteCount} />

        {children}
      </body>
    </html>
  );
}
