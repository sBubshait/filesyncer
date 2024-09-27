"use client";

import { useState, useEffect } from "react";
import { getDownloadLink } from "../../lib/apiClient";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

export default function Viewer({
  params,
}: {
  params: {
    fileID: string;
  };
}) {
  const fileID = params.fileID || "";
  
  const [link, setLink] = useState<string | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string>("");
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchLink() {
      const downloadLink = await getDownloadLink(fileID);
      const fileNameURL = extractFileNameFromLink(downloadLink);
      const mimeTypeGot = getMimeType(fileNameURL || "");
      setFileName(fileNameURL || undefined);
      setMimeType(mimeTypeGot);
      setLink(downloadLink);
    }

    if (fileID) {
      fetchLink();
    }
  }, [fileID]);

  const docs = link
    ? [{ uri: link, fileName: fileName, fileType: mimeType }]
    : [];

  return (
    <div className="p-4 sm:ml-64">
      <div className="mt-14">
        <div
          className={`mt-5 min-h-[calc(100vh-6rem)] rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700`}
        >
          <h1 className="mb-2 text-xl font-semibold dark:text-white">
            File Viewer
          </h1>

          {docs.length > 0 ? (
            <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />
          ) : (
            <p>Loading document...</p>
          )}
        </div>
      </div>
    </div>
  );
}

const mimeTypes: { [key: string]: string } = {
  bmp: "image/bmp",
  csv: "text/csv",
  odt: "application/vnd.oasis.opendocument.text",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  htm: "text/htm",
  html: "text/html",
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  tiff: "image/tiff",
  txt: "text/plain",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  mp4: "video/mp4",
  webp: "image/webp",
};

function getMimeType(extension: keyof typeof mimeTypes): string {
  return mimeTypes[extension] || "application/octet-stream"; // Default if unsupported type
}

function extractFileNameFromLink(link: string): string | null {
    try {
      const url = new URL(link);
      const params = new URLSearchParams(url.search);
      const contentDisposition = params.get("response-content-disposition");
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename\s*=\s*["']?([^"']+)["']?/);
  
        if (fileNameMatch && fileNameMatch[1]) {
          return decodeURIComponent(fileNameMatch[1]);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting filename:", error);
      return null;
    }
  }