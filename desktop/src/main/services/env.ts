import fs from 'fs';
import paths from './paths';

const updateEnvFile = (updates: Record<string, string | undefined>) => {
  const envPath = paths.getEnvPath();
  let envContent = '';

  try {
    envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  } catch (error) {
    console.error('Error reading env file:', error);
  }

  const envVars: Record<string, string> = {};
  envContent
    .split('\n')
    .filter((line) => line.trim())
    .forEach((line) => {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      envVars[key] = value;
    } else {
      delete envVars[key];
    }
  });

  const newContent = `${Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;

  fs.writeFileSync(envPath, newContent);
};

export default { updateEnvFile };
