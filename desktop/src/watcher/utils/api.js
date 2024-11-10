const axios = require('axios');
const logger = require('./logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_URL = require('../config.json').API_URL;

let token = process.env.ACCESS_TOKEN;

async function addFile(pathname, size) {
  try {
    const response = await makeRequest('POST', `${API_URL}/addFile`, {
      pathname,
      size,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding file:', error);
    logger.error(`Error adding file ${pathname}`);
  }
}

async function deleteFile(fileID) {
  try {
    const response = await makeRequest('POST', `${API_URL}/deleteFile`, {
      fileID,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error removing file:', error);
    return false;
  }
}

async function getFileID(pathname) {
  try {
    const response = await makeRequest(
      'GET',
      `${API_URL}/getFileID?pathname=${pathname}`,
    );
    return response.data.fileID;
  } catch (error) {
    console.error('Error getting file ID:', error);
    return null;
  }
}

// async function authenticateCredentials(username, password) {
//   try {
//     const response = await axios.post(`${API_URL}/login`, {
//       username,
//       password,
//     });
//     if (response.status === 200) {
//       return response.data.token;
//     }

//     return '';
//   } catch (error) {
//     console.error('Error authenticating credentials:', error);
//     return '';
//   }
// }

/** Helper Functions */

// async function refreshToken() {
//   try {
//     console.log('Refreshing token...');
//     const newToken = await authenticateCredentials(username, password);
//     if (!newToken) {
//       logger.error('Could not refresh token: Please check your credentials');
//       return;
//     }

//     token = newToken;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     logger.error('Could not refresh token');
//   }
// }

async function makeRequest(method, url, data = null) {
  try {
    if (!token) return false;

    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (method === 'POST' && data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const config = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (method === 'POST' && data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    }
  }
}

module.exports = {
  getFileID,
  addFile,
  deleteFile,
};
