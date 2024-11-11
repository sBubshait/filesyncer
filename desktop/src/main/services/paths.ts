import { app } from 'electron';
import path from 'path';

const paths = {
  getStoragePath: () => path.join(app.getPath('userData'), 'storage.json'),
  getWatcherPath: () => path.join(__dirname, '../../src/', 'watcher'),
  getWatcherConfigPath: () => path.join(paths.getWatcherPath(), 'config.json'),
  getEnvPath: () => path.join(paths.getWatcherPath(), '.env'),
};

export default paths;
