const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const aws = require('./aws');
const ignored = require('./ignore');
const config = require('../config.json');
const logger = require('./logger');

directoryPath = config.folderToWatch;

const watcher = chokidar.watch(directoryPath, {
    persistent: true
});

logger.info(`Watcher started for ${directoryPath}`);

watcher
    .on('add', async filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;
        var isIncluded = await db.includesFilePath(filePath);
        if (!isIncluded) {
            logger.info(`File ${filePath} adding to database and AWS S3 initated`);
            await aws.uploadToS3(filePath);
            await db.addFilePath(filePath);
        }
    })

    .on('change', filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;
        logger.info(`File ${filePath} has been changed. Updating AWS S3`);
        aws.updateFile(filePath);
    })
    
    .on('unlink', filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;
        logger.info(`File ${filePath} has been deleted. Deleting from AWS S3`);
        aws.deleteFromS3(filePath);
        db.deleteFilePath(filePath);
    });