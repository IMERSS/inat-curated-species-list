import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBackupSettings } from './backup-settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMainSettings = () => {
  const { exists, backupSettings } = getBackupSettings();

  if (!exists) {
    return {};
  }

  const settingsFile = `${backupSettings.backupFolder}/main-settings.json`;
  let settings = {};
  if (fs.existsSync(settingsFile)) {
    const content = fs.readFileSync(settingsFile, { encoding: 'utf8' });
    settings = JSON.parse(content);
  }

  return settings;
};

export const updateMainSettings = (data) => {
  const { backupSettings } = getBackupSettings();

  const settingsFile = `${backupSettings.backupFolder}/main-settings.json`;
  fs.writeFileSync(settingsFile, JSON.stringify(data, null, '  '));

  return {
    success: true,
  };
};
