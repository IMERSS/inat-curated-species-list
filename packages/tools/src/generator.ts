/**
 * The main data file generation script.
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
import { parseDataFiles } from './helpers';
import { GeneratorConfig, NewAddition } from '../types/generator.types';
import { CuratedSpeciesData } from '@imerss/inat-curated-species-list-common';
import { performance } from 'perf_hooks';

const { config: configFilePath } = yargs(hideBin(process.argv)).argv;

const generateSpeciesDataFile = (config: GeneratorConfig, speciesData: CuratedSpeciesData, tempFolder: string) => {
  const minifiedSpeciesData = minifySpeciesData(speciesData, config.taxons);

  const filename = path.resolve(tempFolder, config.speciesDataFilename);
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
  fs.writeFileSync(filename, JSON.stringify(minifiedSpeciesData));

  return filename;
};

const sortByConfirmationDate = (a, b) => {
  if (a.confirmationDateUnix < b.confirmationDateUnix) {
    return -1;
  } else if (a.confirmationDateUnix > b.confirmationDateUnix) {
    return 1;
  }
  return 0;
};

export const getDataFilesContent = (config: GeneratorConfig, numDataFiles: number, tempFolder: string) => {
  const { curators, taxons, baselineEndDate } = config;
  const { newAdditions, taxonChangeDataGroupedByYear } = parseDataFiles(numDataFiles, curators, taxons, tempFolder);

  const newAdditionsArray: NewAddition[] = [];
  Object.keys(newAdditions).forEach((taxonId) => {
    newAdditions[taxonId].observations.sort(sortByConfirmationDate);

    // ignore any taxons that have confirmed observations prior to `baselineEndDate`
    if (newAdditions[taxonId].observations[0].confirmationDate < baselineEndDate) {
      return;
    }

    newAdditionsArray.push({
      ...newAdditions[taxonId].observations[0],
      taxonId,
      speciesName: newAdditions[taxonId].speciesName,
      user: newAdditions[taxonId].observations[0].user,
      taxonomy: newAdditions[taxonId].taxonomy,
    });
  });

  // sort remaining data
  newAdditionsArray.sort(sortByConfirmationDate);

  return {
    newAdditionsArray,
    taxonChangeDataGroupedByYear,
  };
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
    speciesDataFilename: 'species-data.json',
    newAdditionsFilename: 'new-additions-data.json',
    taxons: DEFAULT_TAXONS,
    ...config.default,
  };

  const tempFolderFullPath = path.resolve(process.cwd(), cleanConfig.tempFolder);

  clearTempFolder(tempFolderFullPath);
  const logger = initLogger(tempFolderFullPath);
  const start = performance.now();

  console.log('Step 1: download data from iNat');
  const { numRequests } = await downloadDataPackets(cleanConfig, tempFolderFullPath, logger);
  const end = performance.now();
  const date = new Date(end - start);
  console.log(`Time taken: ${date.getMinutes()}:${date.getSeconds()}s`);

  console.log('\nStep 2: extract species list');
  const speciesData = extractSpeciesList(cleanConfig, tempFolderFullPath, numRequests);

  console.log('\nStep 3: generate data file');
  const speciesDataFilename = generateSpeciesDataFile(cleanConfig, speciesData, tempFolderFullPath);

  console.log('\nStep 4: parsing data');
  const { newAdditionsArray, taxonChangeDataGroupedByYear } = getDataFilesContent(
    cleanConfig,
    numRequests,
    tempFolderFullPath,
  );

  let newAdditionsDataFilename = null;
  if (cleanConfig.trackNewAdditions) {
    console.log('\nStep 5: generate new additions data file');
    const newAdditionsFile = path.resolve(`${tempFolderFullPath}/${cleanConfig.newAdditionsFilename}`);
    fs.writeFileSync(newAdditionsFile, JSON.stringify(newAdditionsArray), 'utf-8');
  }

  let taxonChangesFilename = null;
  if (cleanConfig.trackTaxonChanges) {
    console.log('\nStep 6: generate taxon changes data file');
    taxonChangesFilename = path.resolve(`${tempFolderFullPath}/${cleanConfig.taxonChangesFilename}`);
    fs.writeFileSync(taxonChangesFilename, JSON.stringify(taxonChangeDataGroupedByYear), 'utf-8');
  }

  console.log('\n__________________________________________');
  console.log(`Complete. Data file(s) generated:`);
  console.log(speciesDataFilename);
  if (newAdditionsDataFilename) {
    console.log(newAdditionsDataFilename);
  }
})();
