import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import Navbar from './components/Navbar';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FileSyncer",
  description: "Manage your files anywhere with FileSyncer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <body>
        <Navbar title="FileSyncer" />
          {children}
      </body>
    </html>
  );
}