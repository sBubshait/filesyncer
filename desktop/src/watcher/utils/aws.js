const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function uploadFile(fileID, filePath) {
  try {
    let fileContent = await fs.promises.readFile(filePath);
    let params = {
      Bucket: bucketName,
      Key: fileID,
      Body: fileContent,
    };

    let data = await s3.upload(params).promise();
  } catch (err) {
    console.log('Error', err);
  }
}

async function deleteFile(fileID) {
  try {
    let params = {
      Bucket: bucketName,
      Key: fileID,
    };

    let data = await s3.deleteObject(params).promise();
  } catch (err) {
    console.log('Error', err);
  }
}

async function updateFile(fileID, filePath) {
  try {
    await deleteFile(fileID);
    await uploadFile(fileID, filePath);
  } catch (err) {
    console.log('Error', err);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  updateFile,
};
