import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;

export const generateDownloadLink = (fileID: string): string => {
  // Generate a signed URL for the file valid for 1 hour

  const params = {
    Bucket: bucketName,
    Key: fileID,
    Expires: 60 * 60,
  };

  try {
    const url = s3.getSignedUrl("getObject", params);
    return url;
  } catch (error) {
    console.error("Error generating signed URL", error);
    throw new Error("Failed to generate signed URL");
  }
};
