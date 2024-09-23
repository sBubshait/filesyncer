const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const aws = require('./aws');
const ignored = require('./ignore');
const config = require('../config.json');
const logger = require('./logger');

if (config.foldersToWatch.length == 0) {
    logger.info('No folders to watch specified in config.json');
} else {
    logger.info(`Watcher started for (${config.foldersToWatch.length}) folders`);
}

let watcher = chokidar.watch(config.foldersToWatch, {
    persistent: true,
});

watcher
    .on('add', async filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;

        const { added, fileID } = await db.addFile(filePath);
        if (added) {
            logger.info(`New file detected: ${filePath}. Adding to database with ID ${fileID}...`);
            
            await aws.uploadFile(fileID, filePath);
        }
    })

    .on('change', async filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;

        const fileID = await db.getFileID(filePath);
        if (fileID) {
            logger.info(`File update detected: ${filePath} with ID ${fileID}. Reuploading to Storage...`);

            aws.updateFile(fileID, filePath);
        }
    })
    
    .on('unlink', async filePath => {
        if (ignored.includes(path.basename(filePath))) 
            return false;
        
        const fileID = await db.getFileID(filePath);
        if (fileID) {
            logger.info(`File deletion detected: ${filePath} with ID ${fileID}. Removing from Storage...`);

            db.deleteFile(fileID);
            aws.deleteFile(fileID);
        }
    });