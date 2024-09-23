const axios = require('axios');
const logger = require('./logger');

const API_URL = require('../config.json').API_URL;

async function addFile(pathname, size) {
  try {
    const response = await axios.post(`${API_URL}/addFile`, { pathname, size });
    return response.data;
  } catch (error) {
    console.error('Error adding file:', error);
    logger.error(`Error adding file ${pathname}`);
  }
}

async function deleteFile(fileID) {
  try {
    const response = await axios.post(`${API_URL}/deleteFile`, { fileID });
    return response.status === 200;
  } catch (error) {
    console.error('Error removing file:', error);
    return false;
  }
}

async function getFileID(pathname) {
  try {
    const response = await axios.get(`${API_URL}/getFileID?pathname=${pathname}`);
    console.log(response.data);
    return response.data.fileID;
  } catch (error) {
    console.error('Error getting file ID:', error);
    return null;
  }
}

module.exports = {
  getFileID,
  addFile,
  deleteFile
};
