import React, { useMemo } from "react";
import Uppy from "@uppy/core";
import { Dashboard, useUppyState } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import Cookies from "js-cookie";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

const API_URL = process.env.API_URL || "http://localhost:3000";

interface UploaderProps {
  onUploadComplete?: (results: any[]) => void;
  onUploadError?: (error: Error) => void;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  folderID?: string | null;
}

function createUppy({
  maxFileSize,
  maxNumberOfFiles,
  folderID,
  onUploadComplete,
  onUploadError,
}: UploaderProps) {
  const token = Cookies.get("token");
  console.log("Creating uppy instance");

  const uppy = new Uppy({
    debug: true,
    autoProceed: true,
    restrictions: {
      maxFileSize,
      maxNumberOfFiles,
      allowedFileTypes: null,
    },
  });

  uppy.use(AwsS3, {
    endpoint: API_URL,
    getUploadParameters: async (file) => {
      try {
        const response = await fetch(`${API_URL}/generateUploadLink`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folderID: folderID,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get upload parameters");
        }

        const data = await response.json();
        return {
          method: "POST",
          url: data.uploadLink.url,
          fields: data.uploadLink.fields,
        };
      } catch (error) {
        console.error("Error getting upload parameters:", error);
        throw error;
      }
    },
  });

  if (onUploadComplete) {
    uppy.on("complete", (result) => {
      // onUploadComplete(result.successful!);
    });
  }

  if (onUploadError) {
    uppy.on("error", (error) => {
      // onUploadError(error);
    });
  }

  return uppy;
}

export default function Uploader(props: UploaderProps) {
  // Use useMemo to ensure the uppy instance is created only once, not on every re-render
  const uppy = useMemo(() => createUppy(props), [props]);

  // Optional: Use these if you want to show progress or file count
  const fileCount = useUppyState(
    uppy,
    (state) => Object.keys(state.files).length,
  );
  const totalProgress = useUppyState(uppy, (state) => state.totalProgress);

  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="uppy-dashboard mx-auto w-full max-w-3xl">
      <Dashboard
        uppy={uppy}
        width="100%"
        height="400px"
        showProgressDetails
        showRemoveButtonAfterComplete
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
