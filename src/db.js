const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');
let isInit = false;

let db = new sqlite3.Database('./fileDB.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    logger.info('Connected to the file database.');
});

async function init() {
    if (isInit)
        return true;
    return new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS filelist (
            path TEXT PRIMARY KEY
        )`, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
            isInit = true;
            logger.info('Initialized file database.')
        });
    });
}

async function addFilePath(filePath) {
    await init();
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO filelist(path) VALUES(?)`, [filePath], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function deleteFilePath(filePath) {
    await init();
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM filelist WHERE path = ?`, [filePath], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function getAllFilePaths() {
    await init();
    return new Promise((resolve, reject) => {
        db.all(`SELECT path FROM filelist`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// includes function
async function includesFilePath(filePath) {
    await init();
    return new Promise((resolve, reject) => {
        db.get(`SELECT path FROM filelist WHERE path = ?`, [filePath], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

module.exports = {
    init,
    addFilePath,
    deleteFilePath,
    getAllFilePaths,
    includesFilePath
};