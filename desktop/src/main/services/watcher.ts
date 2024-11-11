import { execSync } from 'child_process';
import path from 'path';
import paths from './paths';

const getStatus = () => {
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
};

const start = () => {
  try {
    const watcherScript = path.join(paths.getWatcherPath(), 'index.js');
    execSync(`pm2 start ${watcherScript} --name filesyncer`, {
      stdio: 'inherit',
    });
    execSync('pm2 save', { stdio: 'inherit' });
    const startupScript = execSync('pm2 startup', { stdio: 'inherit' });
    if (startupScript) {
      execSync(startupScript.toString(), { stdio: 'inherit' });
    }
    return true;
  } catch (error) {
    console.error('Error starting watcher:', error);
    throw error;
  }
};

const stop = () => {
  try {
    execSync('pm2 stop filesyncer', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error stopping watcher:', error);
    throw error;
  }
};

const restart = () => {
  try {
    execSync('pm2 restart filesyncer', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error restarting watcher:', error);
    throw error;
  }
};

export default { getStatus, start, stop, restart };
