"use client"; // Client-side component for fetching search results

import { useState, useEffect } from "react";
import { FileFolder } from "../types";
import FilesCard from "./FilesCard";
import { searchFiles } from "../api";
import SearchResultsFilesCard from "./SearchResultsFilesCard";

export default function SearchResults({ query }: { query: string }) {
  const [files, setFiles] = useState<FileFolder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        setLoading(true);
        try {
          const result = await searchFiles(query);
          setFiles(result);
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return <p>Loading search results...</p>;
  }
  return <SearchResultsFilesCard query={query} title="Search Results" files={files} extended={true} />;
}
