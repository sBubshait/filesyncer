import AWS from "aws-sdk";
import dotenv from "dotenv";
import db from "./db/index.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4"
});

const bucketName = process.env.AWS_BUCKET_NAME;

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

export const validateAWSConfig = async (config: AWSConfig): Promise<boolean> => {
  try {
    // Create a new S3 instance with the provided credentials
    const testS3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      signatureVersion: "v4"
    });

    // Try to list objects in the bucket (with max 1 result)
    // This will test both the credentials and bucket access
    await testS3.listObjectsV2({
      Bucket: config.bucketName,
      MaxKeys: 1
    }).promise();

    return true;
  } catch (error) {
    console.error('AWS Credentials validation failed:', error);
    return false;
  }
};

export const generateDownloadLink = (fileID: string, displayName: string = fileID): string => {
  // Generate a signed URL for the file valid for 1 hour

  const params = {
    Bucket: bucketName,
    Key: fileID,
    Expires: 60 * 60,
    ResponseContentDisposition: 'attachment; filename ="' + displayName + '"'
  };

  try {
    const url = s3.getSignedUrl("getObject", params);
    return url;
  } catch (error) {
    console.error("Error generating signed URL", error);
    throw new Error("Failed to generate signed URL");
  }
};

export const generateUploadLink = async (filename: string, contentType: string, folderID?: string): Promise<{ url: string, fields: any, data: { fileID: string, folderID?: string, fileName: string, fileType: string | null, size: number } }> => {
  try {
    if (folderID) {
      // If a folderID is provided, check if the folder exists
      const folder = await db.folder.get(folderID);
      if (!folder) {
        throw new Error("Could not find folder to insert file into");
      }
    }

    const fileParts = filename.split(".");
    const fileName = fileParts[0];
    const fileType = fileParts.length > 1 ? fileParts[1] : "";
    const fileID = uuidv4();

    // Add file to database first
    await db.file.create({
      fileID: fileID,
      folderID: folderID || null,
      size: 0n,
      fileName: fileName,
      fileType,
      filePath: fileID,
    });

    // Create presigned post parameters
    const params = {
      Bucket: bucketName,
      Fields: {
        key: fileID, 
        acl: 'private',
        success_action_status: '201',
        'Content-Type': contentType,
      },
      Conditions: [
        ['content-length-range', 0, 100 * 1024 * 1024],
        ['eq', '$key', fileID],
        ['eq', '$acl', 'private'],
        ['eq', '$success_action_status', '201'],
        ['starts-with', '$Content-Type', '']
      ],
      Expires: 3600
    };

    return new Promise((resolve, reject) => {
      s3.createPresignedPost(params, (err, data) => {
        if (err) {
          console.error('Presigning error:', err);
          reject(err);
          return;
        }

        resolve({
          url: data.url,
          fields: {
            ...data.fields,
            key: fileID,
            'Content-Type': contentType,
          },
          data: {
            fileID,
            folderID,
            fileName: filename,
            fileType,
            size: 0,
          }
        });
      });
    });
  } catch (error) {
    console.error("Error generating upload link:", error);
    throw error;
  }
};