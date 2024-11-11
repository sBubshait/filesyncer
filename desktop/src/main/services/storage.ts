import fs from 'fs';
import paths from './paths';

const read = () => {
  try {
    const path = paths.getStoragePath();
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf8');
      return JSON.parse(data);
    }

    return {};
  } catch (error) {
    console.error('Error reading storage:', error);
    return {};
  }
};

const write = (data: any) => {
  try {
    const path = paths.getStoragePath();
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing storage:', error);
    return false;
  }
};

export default { read, write };
