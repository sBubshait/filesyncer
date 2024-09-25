"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { FileFolder } from "../types.js";
import {
  DropdownIcon,
  ViewIcon,
  DeleteIcon,
  DownloadIcon,
  HeartIcon,
  CloseIcon,
} from "./icons/ActionIcons"
import { FolderIcon, getFileIcon, canViewFile } from "./icons/FileIcons";
import { TrashIcon } from "./icons/OtherIcons";
import ModalButton from "./ModalButton";
import { getDownloadLink, toggleFavourite } from "../lib/apiClient";

export default function FilesCard({
  title,
  files,
  extended,
}: {
  title: string;
  files: FileFolder[];
  extended?: boolean;
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
    if (highlighted === file.fileID && file.type === 'folder') {
      // If already highlighted, navigate to /view/{fileID}
      router.push(`/folder/${file.fileID}`);
    } else if (highlighted == file.fileID) {
      handleOpenModal(file.fileID);
    } else {
      // Highlight the clicked file
      setHighlighted(file.fileID);
    }
  };

  const handleDownloadClick = async (fileID: string) => {
    try {
      const link = await getDownloadLink(fileID);
      window.open(link, '_blank');
    } catch (error) {
      console.error('Error downloading file', error);
    }
    handleCloseModal();
  };

  const handleFavouriteClick = async (fileID: string) => {
    try {
      await toggleFavourite(fileID);
    } catch (error) {
      console.error('Error toggling favourite', error);
    }
    handleCloseModal();
  };

  return (
    <div
      className={`mt-5 ${extended ? 'min-h-[calc(100vh-6rem)]' : ''} ${
        files.length === 0 ? 'grid grid-cols-1' : ''
      } rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700`}
    >
      <h1 className="text-xl font-semibold dark:text-white">{title}</h1>
      {files.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <TrashIcon className="mr-4 size-12 text-gray-500" />
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold dark:text-white">Nothing here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start by adding files to your directory.
            </p>
          </div>
        </div>
      )}
      <div className="mb-2 mt-4 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:xl:grid-cols-5">
        {files.map((file) => (
          <div
            className={`w-full max-w-sm rounded-lg border ${
              highlighted === file.fileID
                ? 'border-indigo-700'
                : 'border-gray-200 dark:border-gray-700'
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
                      <div className="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {file.name}
                          {file.type == 'file' && `.${file.extension}`}
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
                              ? 'md:grid-cols-4'
                              : 'md:grid-cols-3'
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
                            action={() => handleDownloadClick(file.fileID)}
                          />

                          <ModalButton
                            icon={<HeartIcon />}
                            text="Favourite"
                            action={() => handleFavouriteClick(file.fileID)}
                          />

                          <ModalButton
                            icon={<DeleteIcon />}
                            text="Delete"
                            action={() => console.log('Deleted')}
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
                {file.type === 'folder' ? (
                  <FolderIcon />
                ) : (
                  getFileIcon(file.extension)
                )}
              </div>
              <p
                className={`mt-2 font-bold ${
                  highlighted === file.fileID ? 'text-indigo-700' : 'dark:text-white'
                }`}
              >
                {file.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {file.size} KB {file.extension ? ' | ' + file.extension : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
