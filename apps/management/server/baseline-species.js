import fs from 'fs';
import { getBackupSettings } from './backup-settings.js';

export const getBaselineSpecies = () => {
  const { exists, backupSettings } = getBackupSettings();

  if (!exists) {
    return [];
  }

  const baselineSpecies = `${backupSettings.backupFolder}/baseline-species.json`;
  let data = {};
  if (fs.existsSync(baselineSpecies)) {
    const content = fs.readFileSync(baselineSpecies, { encoding: 'utf8' });
    data = JSON.parse(content);
  }

  return data;
};

export const updateBaselineSpecies = (data) => {
  const { backupSettings } = getBackupSettings();

  const baselineSpeciesFile = `${backupSettings.backupFolder}/baseline-species.json`;

  let error;
  let success = false;
  try {
    const baselineData = {
      validationDate: new Date(),
      data,
    };

    fs.writeFileSync(baselineSpeciesFile, JSON.stringify(baselineData, null, '  '));
    success = true;
  } catch (e) {
    error = 'There was a problem writing to the baseline species file.';
  }

  return {
    success,
    error,
  };
};
