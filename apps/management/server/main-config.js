import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainConfigFile = path.resolve(__dirname, './generated/main-config.json');

export const getMainConfig = () => {
  let config;
  let exists = false;

  try {
    const content = fs.readFileSync(mainConfigFile, { encoding: 'utf8' });
    config = JSON.parse(content);
    exists = true;
  } catch (e) {
    console.log('error: ', mainConfigFile, e);
  }

  return {
    exists,
    config,
  };
};

export const updateMainConfig = (data) => {
  const { backupFolder } = data;

  // verify the folder exists
  if (!fs.existsSync(backupFolder)) {
    return { success: false, error: 'The backup folder does not exist. Please try again.' };
  }

  // if the folder exists, check it's a git repo
  if (!fs.existsSync(`${backupFolder}/.git`)) {
    return {
      success: false,
      error:
        'The backup folder exist but it is not a git repo. This script is designed to store data backups and commit the changes to the repo.',
    };
  }

  try {
    fs.writeFileSync(mainConfigFile, JSON.stringify({ backupFolder }, null, '  '));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};
