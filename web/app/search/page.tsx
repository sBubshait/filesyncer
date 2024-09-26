"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { sidebarItems } from "../sidebar";
import { Suspense } from "react";
import SearchResults from "../components/SearchResults";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query); 
  };

  return (
    <>
      <Navbar title="FileSyncer" />
      <Sidebar
        items={sidebarItems}
        storage={{ total: 20, used: 5 }}
        activeItem="Search"
      />
      <div className="p-4 sm:ml-64">
        <div className="mt-14"></div>
        <form className="mx-auto max-w-md" onSubmit={handleSubmit}>
          <label
            htmlFor="default-search"
            className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg
                className="size-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search files and folders"
              value={query}
              onChange={(e) => setQuery(e.target.value)} 
              required={true}
            />
            <button
              type="submit"
              className="absolute bottom-2.5 end-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Search
            </button>
          </div>
        </form>

        <SearchResults query={searchQuery} />
      </div>
    </>
  );
}