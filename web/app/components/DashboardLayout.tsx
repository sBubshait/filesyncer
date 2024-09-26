"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import { SidebarItem } from "../types";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  FilesIcon,
  HeartIcon,
  ClockIcon,
  SettingsIcon,
} from "./icons/SidebarIcons";

const sidebarItems: {
  topItems: SidebarItem[];
  bottomItems: SidebarItem[];
} = {
  topItems: [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Search", href: "/search", icon: SearchIcon },
    { name: "All Files", href: "/files", icon: FilesIcon, tag: "9" },
    { name: "Favourites", href: "/favourites", icon: HeartIcon, tag: "4" },
    { name: "Recent", href: "/recent", icon: ClockIcon },
  ],
  bottomItems: [
    { name: "Settings", href: "/settings", icon: SettingsIcon, tag: null },
  ],
};

export default function DashboardLayout({
  title,
  storage,
  showSignOut = true,
  children,
}: {
  title: string;
  storage: { total: number; used: number };
  showSignOut?: boolean;
  children?: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const pathname = usePathname();
  console.log(pathname);

  return (
    <div>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 sm:hidden"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="size-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <div className="ms-2 flex md:me-24">
                <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white sm:text-2xl">
                  {title}
                </span>
              </div>
            </div>
            {showSignOut && (
              <div className="flex items-center">
                <div className="ms-3 flex items-center">
                  <div className="text-gray-800 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-white">
                    <SignOutButton />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white pt-20 transition-transform dark:border-gray-700 dark:bg-gray-800
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            {sidebarItems.topItems.map((item) => {
              let isActive = item.href === pathname;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center rounded-lg p-2 text-gray-900 hover:bg-sky-50 ${
                        isActive ? "bg-sky-50" : ""
                    }`}
                  >
                    <div
                      className={`size-5 ${
                        isActive
                          ? "text-indigo-700"
                          : "text-gray-500"
                      } transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`ms-3 font-semibold ${
                        item.tag ? "flex-1 whitespace-nowrap" : ""
                      } ${
                        isActive
                          ? "text-indigo-700 dark:text-white"
                          : ""
                      } group-hover:text-indigo-700`}
                    >
                      {item.name}
                    </span>

                    {item.tag && (
                      <span className="ms-3 inline-flex size-3 items-center justify-center rounded-full bg-blue-100 p-3 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {item.tag}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div>
            <ul className="space-y-2 font-medium">
              {sidebarItems.bottomItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-sky-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <div className="size-5 text-gray-500 transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white">
                      {item.icon}
                    </div>

                    <span className="ms-3 font-semibold group-hover:text-indigo-700">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-2 block max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div className="group flex items-center rounded-lg p-2 text-gray-900">
                <div className="size-5 text-gray-500 transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white">
                  <svg
                    className="size-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                </div>

                <span className="ms-3 font-semibold group-hover:text-indigo-700">
                  Storage
                </span>
              </div>

              <div className="m-2 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2.5 rounded-full bg-blue-600"
                  style={{ width: `${(storage.used / storage.total) * 100}%` }}
                />
              </div>

              <div className="m-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {storage.used} GB of {storage.total} GB used
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
