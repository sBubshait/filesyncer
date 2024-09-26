"use client";

import { useState } from "react";
import Link from "next/link";


export default function Navbar({
  title,
}: {
  title: string;
}) {

  return (
    <div>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <div className="ms-2 flex md:me-24">
                <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white sm:text-2xl">
                  {title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
