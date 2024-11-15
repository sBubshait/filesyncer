"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileFolder } from "../types.js";
import {
  DropdownIcon,
  ViewIcon,
  DeleteIcon,
  DownloadIcon,
  HeartIcon,
  CloseIcon,
} from "./icons/ActionIcons";
import { FolderIcon, getFileIcon, canViewFile } from "./icons/FileIcons";
import { TrashIcon } from "./icons/OtherIcons";
import { SearchIcon, MinusSearchIcon, HourglassIcon } from "./icons/OtherIcons";

export default function SearchResultsFilesCard({
  title,
  files,
  query,
  isLoading,
}: {
  title: string;
  files: FileFolder[];
  query?: string;
  isLoading?: boolean;
}) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = (fileID: string) => {
    setOpenModal(fileID);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const handleFileClick = (file: FileFolder) => {
    if (highlighted === file.fileID && file.type === "folder") {
      // If already highlighted, navigate to /view/{fileID}
      router.push(`/folder/${file.fileID}`);
    } else {
      // Highlight the clicked file
      setHighlighted(file.fileID);
    }
  };

  return (
    <div
      className={`mt-5 min-h-[calc(100vh-10rem)] ${
        files.length === 0 ? "grid grid-cols-1" : ""
      } rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700`}
    >
      <h1 className="text-xl font-semibold dark:text-white">{title}</h1>
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <HourglassIcon className="mr-4 size-12 text-gray-500" />
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold dark:text-white">Loading...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait...
            </p>
          </div>
        </div>
      )}

      {!query && (
        <div className="flex h-full items-center justify-center">
          <SearchIcon className="mr-4 size-12 text-gray-500" />
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold dark:text-white">No Results</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start by searching for files and folders.
            </p>
          </div>
        </div>
      )}

      {query && files.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <MinusSearchIcon className="mr-4 size-12 text-gray-500" />
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold dark:text-white">No Results</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No files or folders found for &quot;{query}&quot;.
            </p>
          </div>
        </div>
      )}
      <div className="mb-2 mt-4 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:xl:grid-cols-5">
        {files.map((file) => (
          <div
            className={`w-full max-w-sm rounded-lg border ${
              highlighted === file.fileID
                ? "border-indigo-700"
                : "border-gray-200 dark:border-gray-700"
            } bg-white shadow dark:bg-gray-800`}
            key={file.fileID}
            onClick={() => handleFileClick(file)}
          >
            <div className="flex justify-end px-4 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(file.fileID);
                }}
                className="inline-block rounded-lg p-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                type="button"
              >
                <span className="sr-only">Open modal</span>
                <DropdownIcon />
              </button>

              {/* Modal */}
              {openModal === file.fileID && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50"
                  onClick={handleCloseModal}
                >
                  <div
                    className="relative w-full max-w-2xl p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal content */}
                    <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
                      {/* Modal header */}
                      <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600 md:p-5">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {file.name}
                          {file.type == "file" && `.${file.extension}`}
                        </h3>
                        <button
                          type="button"
                          className="ms-auto inline-flex size-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={handleCloseModal}
                        >
                          <CloseIcon />
                          <span className="sr-only">Close modal</span>
                        </button>
                      </div>
                      {/* Modal body */}
                      <div className="space-y-4 p-4 md:p-5">
                        <div
                          className={`grid ${
                            canViewFile(file.extension)
                              ? "md:grid-cols-4"
                              : "md:grid-cols-3"
                          } gap-4 p-4 sm:grid-cols-2 md:p-5`}
                        >
                          {canViewFile(file.extension) && (
                            <ModalButton
                              icon={<ViewIcon />}
                              text="View"
                              href={`/view/${file.fileID}`}
                            />
                          )}

                          <ModalButton
                            icon={<DownloadIcon />}
                            text="Download"
                            href={`/download/${file.fileID}`}
                          />

                          <ModalButton
                            icon={<HeartIcon />}
                            text="Favourite"
                            action={() => console.log("Favourited")}
                          />

                          <ModalButton
                            icon={<DeleteIcon />}
                            text="Delete"
                            action={() => console.log("Deleted")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center p-6 pt-0">
              <div className="size-12">
                {file.type === "folder" ? (
                  <FolderIcon />
                ) : (
                  getFileIcon(file.extension)
                )}
              </div>
              <p
                className={`mt-2 font-bold ${
                  highlighted === file.fileID
                    ? "text-indigo-700"
                    : "dark:text-white"
                }`}
              >
                {file.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {file.size} KB {file.extension ? " | " + file.extension : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalButton({
  icon,
  text,
  href,
  action,
}: {
  icon: JSX.Element;
  text: string;
  href?: string;
  action?: () => void;
}) {
  return href ? (
    <Link
      className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 p-4 py-6 dark:border-gray-700"
      href={href}
    >
      <div className="size-8">{icon}</div>
      <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
        {text}
      </span>
    </Link>
  ) : (
    <button
      onClick={action}
      className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 p-4 py-6 focus:outline-none dark:border-gray-700"
    >
      <div className="size-8">{icon}</div>
      <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
        {text}
      </span>
    </button>
  );
}
