import { ipcMain } from 'electron';
import storageService from '../services/storage';
import envService from '../services/env';

export default function registerAuthHandlers() {
  ipcMain.handle('get-token', async () => {
    const storage = storageService.read();
    return storage.accessToken || null;
  });

  ipcMain.on('store-token', async (event, token) => {
    try {
      const storage = storageService.read();
      storage.accessToken = token;
      storageService.write(storage);
      envService.updateEnvFile({ ACCESS_TOKEN: token });
      event.reply('token-updated', token);
    } catch (err) {
      console.error('Error storing token:', err);
    }
  });

  ipcMain.handle('clear-token', async () => {
    try {
      const storage = storageService.read();
      delete storage.accessToken;
      storageService.write(storage);
      envService.updateEnvFile({ ACCESS_TOKEN: undefined });
      return true;
    } catch (err) {
      console.error('Error clearing token:', err);
      throw err;
    }
  });
}
