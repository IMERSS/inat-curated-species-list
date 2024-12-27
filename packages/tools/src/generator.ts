/**
 * The data file generation script.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import { downloadDataPackets } from './request';
import { extractSpeciesList } from './extraction';
import { minifySpeciesData } from './minification';
import { clearTempFolder, initLogger } from './logs';
import { DEFAULT_TAXONS } from './constants';
import { CuratedSpeciesData, GeneratorConfig } from '../types/generator.types';

const { config: configFilePath } = yargs(hideBin(process.argv)).argv;

const generateDataFile = (config: GeneratorConfig, speciesData: CuratedSpeciesData, tempFolder: string) => {
  const minifiedSpeciesData = minifySpeciesData(speciesData, config.taxons);

  const filename = path.resolve(tempFolder, config.dataFilename);
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
  fs.writeFileSync(filename, JSON.stringify(minifiedSpeciesData));

  return filename;
};

(async () => {
  // check the user has specified a config file
  if (!configFilePath) {
    console.error('Please specify a --config parameter linking to your config.ts file.');
    process.exit(1);
  }

  // check the file exists
  const configFile = path.resolve(process.cwd(), configFilePath);
  if (!fs.existsSync(configFile)) {
    console.error(`The config file cannot be found at this location: ${configFile}`);
    process.exit(1);
  }

  // assumption here is that it's returning an object of type GeneratorConfig. Runtime check?
  const config = await import(configFile);
  const cleanConfig = {
    tempFolder: './temp',
    dataFilename: 'data.json',
    taxons: DEFAULT_TAXONS,
    ...config.default,
  };

  const tempFolderFullPath = path.resolve(process.cwd(), cleanConfig.tempFolder);

  clearTempFolder(tempFolderFullPath);
  const logger = initLogger(tempFolderFullPath);

  // now to the meat!
  console.log('Step 1: download data from iNat');
  const { numRequests } = await downloadDataPackets(cleanConfig, tempFolderFullPath, logger);

  console.log('Step 2: extract species list');
  const speciesData = extractSpeciesList(cleanConfig, tempFolderFullPath, numRequests);

  console.log('Step 3: generate data file');
  const filename = generateDataFile(cleanConfig, speciesData, tempFolderFullPath);

  console.log('__________________________________________');
  console.log(`Complete. Data file generated: ${filename}`);
})();