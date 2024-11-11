/* eslint-disable no-restricted-syntax */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { AWSConfig } from './env';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

dotenv.config();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const getStoragePath = () => {
  return path.join(app.getPath('userData'), 'storage.json');
};

const getWatcherPath = () => {
  return path.join(__dirname, '../../src/', 'watcher');
};

const getWatcherConfigPath = () => {
  return path.join(getWatcherPath(), 'config.json');
};

const getEnvPath = () => {
  return path.join(getWatcherPath(), '.env');
};

// Read storage
const readStorage = () => {
  try {
    const storagePath = getStoragePath();
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error reading storage:', error);
    return {};
  }
};

// Write storage
const writeStorage = (data: any) => {
  try {
    const storagePath = getStoragePath();
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing storage:', error);
    return false;
  }
};

const updateEnvFile = (updates: Record<string, string | undefined>) => {
  const envPath = getEnvPath();
  let envContent = '';

  // Read existing content if file exists
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    // File doesn't exist yet, start with empty content
  }

  // Convert content to key-value pairs
  const envLines = envContent.split('\n').filter((line) => line.trim());
  const envVars: Record<string, string> = {};

  envLines.forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  // Update with new values
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      envVars[key] = value;
    } else {
      delete envVars[key];
    }
  });

  // Write back to file
  const newContent = `${Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;

  fs.writeFileSync(envPath, newContent);
};

// IPC Handlers
ipcMain.handle('get-token', async () => {
  console.log('get-token');
  console.log(getStoragePath());
  const storage = readStorage();
  return storage.accessToken || null;
});

ipcMain.on('store-token', async (event, token) => {
  console.log('store-token');
  try {
    const storage = readStorage();
    storage.accessToken = token;
    writeStorage(storage);
    updateEnvFile({
      ACCESS_TOKEN: token,
    });
    // Notify renderer of update
    event.reply('token-updated', token);
  } catch (err) {
    console.error('Error storing token:', err);
  }
});

ipcMain.handle('clear-token', async () => {
  console.log('clear-token');
  try {
    const storage = readStorage();
    delete storage.accessToken;
    writeStorage(storage);
    updateEnvFile({
      ACCESS_TOKEN: undefined,
    });

    return true;
  } catch (err) {
    console.error('Error clearing token:', err);
    throw err;
  }
});

// Get AWS config
ipcMain.handle('get-aws-config', async () => {
  console.log('get-aws-config');
  const storage = readStorage();
  return storage.awsConfig || null;
});

// Store AWS config
ipcMain.handle('store-aws-config', async (_, config: AWSConfig) => {
  console.log('store-aws-config');
  try {
    const storage = readStorage();
    storage.awsConfig = config;
    writeStorage(storage);
    updateEnvFile({
      AWS_ACCESS_KEY_ID: config.accessKeyId,
      AWS_SECRET_ACCESS_KEY: config.secretAccessKey,
      AWS_BUCKET_NAME: config.bucketName,
      AWS_REGION: config.region,
    });
    return true;
  } catch (err) {
    console.error('Error storing AWS config:', err);
    throw err;
  }
});

ipcMain.handle('validate-aws-config', async (_, config: AWSConfig) => {
  try {
    // Make an API call to your backend to test the credentials
    console.log(JSON.stringify(config));
    const response = await fetch('http://localhost:3000/validateAWSConfig', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readStorage().accessToken}`,
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate credentials');
    }

    return {
      success: data.success,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error.message || 'Failed to validate credentials',
    };
  }
});

ipcMain.handle('get-sync-status', async () => {
  try {
    const output = execSync('pm2 show filesyncer', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return !(
      output.includes("doesn't exist") ||
      output.includes('errored') ||
      output.includes('stopped')
    );
  } catch (error) {
    return false;
  }
});

ipcMain.handle('start-sync', async () => {
  try {
    const watcherScript = path.join(getWatcherPath(), 'index.js');
    execSync(`pm2 start ${watcherScript} --name filesyncer`, {
      stdio: 'inherit',
    });
    execSync('pm2 save', { stdio: 'inherit' });
    const startupScript = execSync('pm2 startup', {
      stdio: 'inherit',
    });
    if (startupScript) {
      execSync(startupScript.toString(), { stdio: 'inherit' });
    }
    return true;
  } catch (error) {
    console.error(`Error while starting to watch: ${error}`);
    throw error;
  }
});

ipcMain.handle('stop-sync', async () => {
  try {
    execSync('pm2 stop filesyncer', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error while stopping watch: ${error}`);
    throw error;
  }
});

ipcMain.handle('restart-sync', async () => {
  try {
    execSync('pm2 restart filesyncer', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error while restarting watch: ${error}`);
    throw error;
  }
});

const readConfig = () => {
  const configPath = getWatcherConfigPath();
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    // Return default config if file doesn't exist
    return {
      API_URL: 'http://localhost:3000',
      foldersToWatch: [],
    };
  }
};

const writeConfig = (config: any) => {
  const configPath = getWatcherConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

const countFiles = (dirPath: string): number => {
  let count = 0;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      count += 1;
    } else if (stat.isDirectory()) {
      count += countFiles(fullPath);
    }
  }

  return count;
};

// Get watch config
ipcMain.handle('get-watch-config', async () => {
  console.log('get-watch-config');
  return readConfig();
});

// Select folder
ipcMain.handle('select-folder', async () => {
  console.log('select-folder');
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (result.canceled || !result.filePaths[0]) {
    return { canceled: true };
  }

  const folderPath = result.filePaths[0];
  const fileCount = countFiles(folderPath);

  return {
    canceled: false,
    folderPath,
    fileCount,
  };
});

// Show confirmation dialog
ipcMain.handle('show-confirmation', async (_, { message, title }) => {
  console.log('show-confirmation');
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Yes', 'No'],
    title,
    message,
  });

  return result.response === 0;
});

// Add watch folder
ipcMain.handle('add-watch-folder', async (_, folderPath) => {
  console.log('add-watch-folder');
  const config = readConfig();
  if (!config.foldersToWatch.includes(folderPath)) {
    config.foldersToWatch.push(folderPath);
    writeConfig(config);
  }
  return true;
});

// Remove watch folder
ipcMain.handle('remove-watch-folder', async (_, folderPath) => {
  console.log('remove-watch-folder');
  const config = readConfig();
  config.foldersToWatch = config.foldersToWatch.filter(
    (folder: string) => folder !== folderPath,
  );
  writeConfig(config);
  return true;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 512,
    height: 750,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('/'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
