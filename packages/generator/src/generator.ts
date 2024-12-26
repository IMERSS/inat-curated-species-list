/**
 * The data file generation script.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import { downloadDataPackets } from './request';
import { extractSpeciesList } from './extraction';
import { clearTempFolder, initLogger } from './logs';
import { DEFAULT_TAXONS } from './constants';

const { config: configFilePath } = yargs(hideBin(process.argv)).argv;

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
    // default
    tempFolder: './temp',
    taxons: DEFAULT_TAXONS,
    ...config.default,
  };

  const tempFolderFullPath = path.resolve(process.cwd(), cleanConfig.tempFolder);

  // reset the old log folder
  clearTempFolder(tempFolderFullPath);

  // create the logger
  const logger = initLogger(tempFolderFullPath);

  // now to the meat!
  console.log('Step 1: download data from iNat');
  const { numRequests } = await downloadDataPackets(config.default, tempFolderFullPath, logger);

  console.log('Step 2: extract species list');
  const speciesData = extractSpeciesList(config.default, tempFolderFullPath, numRequests);

  console.log(speciesData);

  /*
  // onComplete: () => {
    //   //   const minifiedSpeciesData = minifyData(speciesData, params.taxons);
    //   //   const filename = `${C.GENERATED_FILENAME_FOLDER}/${C.GENERATED_FILENAME}`;
    //   //   if (!fs.existsSync(C.GENERATED_FILENAME_FOLDER)) {
    //   //     fs.mkdirSync(C.GENERATED_FILENAME_FOLDER);
    //   //   }
    //   //   if (fs.existsSync(filename)) {
    //   //     fs.unlinkSync(filename);
    //   //   }
    //   //   fs.writeFileSync(filename, JSON.stringify(minifiedSpeciesData));
    //   //   console.log('__________________________________________');
    //   //   console.log(`Complete. File generated: ${filename}`);
    // },
  */
})();
