/**
 * The data file generation script.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import { downloadDataPacket, DownloadDataPacketResponse } from './request';
import { clearTempFolder, initLogger } from './logs';
import { DEFAULT_TAXONS } from './constants';
import { GeneratorConfig } from '../types/generator.types';
import throttledQueue from 'throttled-queue';

const { config: configFilePath } = yargs(hideBin(process.argv)).argv;

(async () => {
  // check the user's specified a config file
  if (!configFilePath) {
    console.error('Please specify a --config parameter linking to your config.ts file.');
    process.exit(1);
  }

  // check file exists
  const configFile = path.resolve(process.cwd(), configFilePath);
  if (!fs.existsSync(configFile)) {
    console.error(`The config file cannot be found at this location: ${configFile}`);
    process.exit(1);
  }

  // assumption here is that it's returning an object of type GeneratorConfig. Runtime check?
  const config = await import(configFile);
  const {
    curators,
    taxonId,
    placeId,
    taxons = DEFAULT_TAXONS,
    tempFolder = './temp',
  } = config.default as GeneratorConfig;

  // reset the old log folder
  const temporaryFolder = path.resolve(process.cwd(), tempFolder);
  clearTempFolder(temporaryFolder);

  // used for visualizing the download + extraction process
  const progress = new cliProgress.SingleBar({
    format: 'Download progress |' + colors.green('{bar}') + '| {percentage}% || {value}/{total} requests',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  const logger = initLogger(temporaryFolder);

  // limit the requests to iNat to be one per second (plus extra 50ms). Their API forbids anything more and will
  // reject too many requests coming from the same source
  const throttle = throttledQueue(1, 1050);
  const curatorList = curators.join(',');

  // do our initial request. This is the only request that returns the total number of results in the result set. Once
  // we get the data back, initialize the progress bar and kick off all the remaining requests within our request throttler
  const { totalResults, numRequests } = await throttle<DownloadDataPacketResponse>(() =>
    downloadDataPacket({
      curators: curatorList,
      placeId,
      taxonId,
      packetNum: 1,
      tempFolder: temporaryFolder,
      logger,
    }),
  );

  if (totalResults === 0) {
    return;
  }

  progress.start(numRequests, 1);

  //   for (let i = 2; i < numRequests; i++) {
  //     throttle(() => {});
  //   }

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
    // onError: () => {
    //   console.error('Error loading data:');
    // },*/

  progress.stop();
})();
