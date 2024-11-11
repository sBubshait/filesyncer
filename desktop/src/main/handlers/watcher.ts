import { ipcMain, dialog } from 'electron';
import watcherService from '../services/watcher';
import configService from '../services/config';

export default function registerWatcherHandlers() {
  ipcMain.handle('get-sync-status', async () => {
    return watcherService.getStatus();
  });

  ipcMain.handle('start-sync', async () => {
    return watcherService.start();
  });

  ipcMain.handle('stop-sync', async () => {
    return watcherService.stop();
  });

  ipcMain.handle('restart-sync', async () => {
    return watcherService.restart();
  });

  ipcMain.handle('get-watch-config', async () => {
    return configService.read();
  });

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true };
    }

    const folderPath = result.filePaths[0];
    const fileCount = configService.countFiles(folderPath);

    return {
      canceled: false,
      folderPath,
      fileCount,
    };
  });

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

  ipcMain.handle('add-watch-folder', async (_, folderPath) => {
    const config = configService.read();
    if (!config.foldersToWatch.includes(folderPath)) {
      config.foldersToWatch.push(folderPath);
      configService.write(config);
    }
    return true;
  });

  ipcMain.handle('remove-watch-folder', async (_, folderPath) => {
    const config = configService.read();
    config.foldersToWatch = config.foldersToWatch.filter(
      (folder: string) => folder !== folderPath,
    );
    configService.write(config);
    return true;
  });
}
