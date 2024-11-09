import React, { useEffect, useCallback, useMemo } from "react";
import Uppy from "@uppy/core";
import DashboardPlugin from "@uppy/dashboard";
import { Dashboard } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import Cookies from 'js-cookie';

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

interface UploaderProps {
  onUploadComplete?: (results: any[]) => void;
  onUploadError?: (error: Error) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  folderID?: string | null;
}

export default function Uploader({
  onUploadComplete,
  onUploadError,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxNumberOfFiles = 10,
  folderID = null,
}: UploaderProps) {
  const token = Cookies.get('token');

  const uppy = useMemo(() => {
    return new Uppy({
      debug: true,
      autoProceed: true,
      restrictions: {
        maxFileSize: maxFileSize,
        maxNumberOfFiles: maxNumberOfFiles,
        allowedFileTypes: null,
      },
    }).use(AwsS3, {
      endpoint: "http://localhost:3000",
      getUploadParameters: async (file) => {
        try {
          const response = await fetch("http://localhost:3000/generateUploadLink", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
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
            fields: {
              key: data.uploadLink.fields.key,  // Must be first
              ...data.fields,
              'Content-Type': file.type,
            },
          };
        } catch (error) {
          console.error("Error getting upload parameters:", error);
          throw error;
        }
      },
    });
  }, [maxFileSize, maxNumberOfFiles, folderID]);

  // Handle successful uploads
  useEffect(() => {
    if (onUploadComplete) {
      uppy.on('complete', (result) => {
        onUploadComplete(result.successful!);
      });
    }

    if (onUploadError) {
      uppy.on('error', (error) => {
        onUploadError(error);
      });
    }

    return () => {
    //   uppy.close();
    };
  }, [uppy, onUploadComplete, onUploadError]);

  return (
    <div className="uppy-dashboard mx-auto w-full max-w-3xl">
      <Dashboard
        uppy={uppy}
        plugins={[]}
        width="100%"
        height="400px"
        showProgressDetails
        showRemoveButtonAfterComplete
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}