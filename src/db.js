const axios = require('axios');
const logger = require('./logger');

const API_URL = 'http://localhost:3000';

async function addFile(pathname) {
  try {
    const response = await axios.post(`${API_URL}/addFile`, { pathname });
    return response.data;
  } catch (error) {
    console.error('Error adding file:', error);
    logger.error(`Error adding file ${pathname}`);
  }
}

async function removeFile(pathname) {
  try {
    const response = await axios.post('http://localhost:3000/removeFile', { pathname });
    return response.status === 200;
  } catch (error) {
    console.error('Error removing file:', error);
    return false;
  }
}

module.exports = {
  addFile,
  removeFile
};
