import { ipcMain } from 'electron';
import storageService from '../services/storage';
import envService from '../services/env';
import { AWSConfig } from '../types';

export default function registerAWSHandlers() {
  ipcMain.handle('get-aws-config', async () => {
    const storage = storageService.read();
    return storage.awsConfig || null;
  });

  ipcMain.handle('store-aws-config', async (_, config: AWSConfig) => {
    try {
      const storage = storageService.read();
      storage.awsConfig = config;
      storageService.write(storage);
      envService.updateEnvFile({
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
      const response = await fetch('http://localhost:3000/validateAWSConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storageService.read().accessToken}`,
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate credentials');
      }

      return { success: data.success };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        error: error.message || 'Failed to validate credentials',
      };
    }
  });
}
