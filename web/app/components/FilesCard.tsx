"use client";

import { useState } from "react";
import Link from "next/link";
import { FileFolder } from "../types.js";

export default function FilesCard({
  title,
  files,
}: {
  title: string;
  files: FileFolder[];
}) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleOpenModal = (fileID: string) => {
    setOpenModal(fileID);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  return (
    <div className="mt-5 rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
      <h1 className="text-xl font-semibold dark:text-white">{title}</h1>

      <div className="mb-2 mt-4 grid grid-cols-5 gap-8">
        {files.map((file) => (
          <div
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800"
            key={file.fileID}
          >
            <div className="flex justify-end px-4 pt-2">
              <button
                onClick={() => handleOpenModal(file.fileID)}
                className="inline-block rounded-lg p-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                type="button"
              >
                <span className="sr-only">Open modal</span>
                <svg
                  className="size-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 3"
                >
                  <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                </svg>
              </button>

              {/* Modal */}
              {openModal === file.fileID && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
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
                          {file.type == "file" && `.${file.extension}`}
                        </h3>
                        <button
                          type="button"
                          className="ms-auto inline-flex size-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={handleCloseModal}
                        >
                          {CloseIcon}
                          <span className="sr-only">Close modal</span>
                        </button>
                      </div>
                      {/* Modal body */}
                      <div className="space-y-4 p-4 md:p-5">
                        <div
                          className={`grid ${viewableExtensions.includes(file.extension) ? "grid-cols-4" : "grid-cols-3"} gap-4 p-4 md:p-5`}
                        >
                          {viewableExtensions.includes(file.extension) && (
                            <ModalButton
                              icon={viewIcon}
                              text="View"
                              href={`/view/${file.fileID}`}
                            />
                          )}

                          <ModalButton
                            icon={downloadIcon}
                            text="Download"
                            href={`/download/${file.fileID}`}
                          />

                          <ModalButton
                            icon={HeartIcon}
                            text="Favourite"
                            action={() => console.log("Favourited")}
                          />

                          <ModalButton
                            icon={deleteIcon}
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
                {file.type === "folder"
                  ? folderIcon
                  : (file.extension &&
                      fileTypeIcon.find((icon) =>
                        icon.extensions.includes(file.extension),
                      )?.icon) ||
                    otherIcon}
              </div>
              <p className="mt-2 font-bold dark:text-white">{file.name}</p>
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

const fileTypeIcon = [{ extensions: ["pdf"], icon: <></> }];

const otherIcon = (
  <svg
    className="svg-icon"
    style={{
      verticalAlign: "middle",
      fill: "currentColor",
      overflow: "hidden",
    }}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path
      d="M967.111111 281.6V910.222222c0 62.862222-50.915556 113.777778-113.777778 113.777778H170.666667c-62.862222 0-113.777778-50.915556-113.777778-113.777778V113.777778c0-62.862222 50.915556-113.777778 113.777778-113.777778h514.844444L967.111111 281.6z"
      fill="#BABABA"
    />{" "}
    <path
      d="M685.511111 167.822222V0L967.111111 281.6H799.288889c-62.862222 0-113.777778-50.915556-113.777778-113.777778"
      fill="#979797"
    />{" "}
    <path
      d="M733.667556 632.689778a111.104 111.104 0 0 1-110.819556 110.819555h-221.667556a111.132444 111.132444 0 0 1-110.848-110.819555 111.047111 111.047111 0 0 1 99.754667-110.279111A122.197333 122.197333 0 0 1 512 407.694222a122.197333 122.197333 0 0 1 121.912889 114.716445 111.160889 111.160889 0 0 1 99.754667 110.279111"
      fill="#FFFFFF"
    />
  </svg>
);

const folderIcon = (
  <svg
    className="svg-icon"
    style={{
      verticalAlign: "middle",
      fill: "currentColor",
      overflow: "hidden",
    }}
    viewBox="0 0 1228 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path
      d="M1196.987733 212.5824v540.0576c0 39.594667-34.474667 71.3728-76.765866 71.3728H323.242667c-51.780267 0-88.746667-46.762667-73.250134-92.808533l126.737067-375.808H70.417067C31.675733 355.362133 0 326.4512 0 291.089067V98.372267C0 63.044267 31.675733 34.0992 70.417067 34.0992h378.811733c26.7264 0 51.029333 13.9264 63.010133 35.703467l39.048534 71.406933H1120.256c42.257067 0 76.8 32.119467 76.8 71.3728"
      fill="#5398DF"
    />{" "}
    <path
      d="M1128.721067 997.853867H68.266667a68.266667 68.266667 0 0 1-68.266667-68.266667V280.3712a68.266667 68.266667 0 0 1 68.266667-68.266667h1060.4544a68.266667 68.266667 0 0 1 68.266666 68.266667V929.5872a68.266667 68.266667 0 0 1-68.266666 68.266667"
      fill="#85BCFF"
    />
  </svg>
);

const downloadIcon = (
  <svg
    className="text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      d="M13 11.15V4a1 1 0 1 0-2 0v7.15L8.78 8.374a1 1 0 1 0-1.56 1.25l4 5a1 1 0 0 0 1.56 0l4-5a1 1 0 1 0-1.56-1.25L13 11.15Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M9.657 15.874 7.358 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.358l-2.3 2.874a3 3 0 0 1-4.685 0ZM17 16a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z"
      clipRule="evenodd"
    />
  </svg>
);

const HeartIcon = (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
  </svg>
);

const deleteIcon = (
  <svg
    className="text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
      clipRule="evenodd"
    />
  </svg>
);

const viewIcon = (
  <svg
    className="text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon = (
  <svg
    className="size-3"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 14"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
    />
  </svg>
);

const viewableExtensions = [
  "pdf",
  "txt",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

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
