import fs from 'fs';
import { getBackupSettings } from './backup-settings.js';

export const getBaselineData = () => {
  const { exists, backupSettings } = getBackupSettings();

  if (!exists) {
    return {};
  }

  const baselineData = `${backupSettings.backupFolder}/baseline-data.json`;
  let data = {};
  if (fs.existsSync(baselineData)) {
    const content = fs.readFileSync(baselineData, { encoding: 'utf8' });
    data = JSON.parse(content);
  }

  return data;
};

export const updateBaselineData = (data) => {
  const { backupSettings } = getBackupSettings();

  const baselineDataFile = `${backupSettings.backupFolder}/baseline-data.json`;
  fs.writeFileSync(baselineDataFile, JSON.stringify(data, null, '  '));

  return {
    success: true,
  };
};
