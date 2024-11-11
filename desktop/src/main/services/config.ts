import fs from 'fs';
import path from 'path';
import paths from './paths';

const read = () => {
  try {
    const configPath = paths.getWatcherConfigPath();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    return {
      API_URL: 'http://localhost:3000',
      foldersToWatch: [],
    };
  }
};

const write = (config: any) => {
  const configPath = paths.getWatcherConfigPath();
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

export default { read, write, countFiles };
