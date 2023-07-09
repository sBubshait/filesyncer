const AWS = require('aws-sdk');
const config = require('../config.json');
const path = require('path');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretAccessKey
});

const bucketName = config.bucketName;
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