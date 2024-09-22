const AWS = require('aws-sdk');
const config = require('../config.json');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const bucketName = process.env.AWS_BUCKET_NAME;
let absoluteDirectoryPath = config.folderToWatch;


async function uploadToS3(filePath) {
    try {
        let fileContent = await fs.promises.readFile(filePath);
        let params = {
            Bucket: bucketName,
            Key: path.relative(absoluteDirectoryPath, path.resolve(filePath)),
            Body: fileContent
        };
        let data = await s3.upload(params).promise();
    } catch(err) {
        console.log("Error", err);
    }
}

async function deleteFromS3(filePath) {
    try {
        let params = {
            Bucket: bucketName,
            Key: path.relative(absoluteDirectoryPath, path.resolve(filePath)),
        };
        let data = await s3.deleteObject(params).promise();
        await db.deleteFilePath(filePath);
    } catch(err) {
        console.log("Error", err);
    }
}

async function updateFile(filePath) {
    try {
        await deleteFromS3(filePath);
        await uploadToS3(filePath);
    } catch(err) {
        console.log("Error", err);
    }
}


module.exports =  {
    uploadToS3,
    deleteFromS3,
    updateFile
}