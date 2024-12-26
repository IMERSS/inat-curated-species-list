/**
 * The data file generation script.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import { downloadDataByPacket } from './request';
import { DEFAULT_TAXONS } from './constants';
import { GeneratorConfig } from '../types/generator.types';

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

  // assumption here is that it's returning an object of type GeneratorConfig
  const config: GeneratorConfig = await import(configFile);
  const { curators, taxonId, placeId, taxons = DEFAULT_TAXONS } = config;

  const progress = new cliProgress.SingleBar({
    format: 'Download progress |' + colors.green('{bar}') + '| {percentage}% || {value}/{total} requests',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  downloadDataByPacket({
    ident_user_id: curators,
    place_id: placeId,
    taxon_id: taxonId,
    verifiable: 'any',
    taxons,
    packetNum: 1,
    onPacketComplete: () => {},
    onComplete: (speciesData, params) => {
      //   const minifiedSpeciesData = minifyData(speciesData, params.taxons);
      //   const filename = `${C.GENERATED_FILENAME_FOLDER}/${C.GENERATED_FILENAME}`;
      //   if (!fs.existsSync(C.GENERATED_FILENAME_FOLDER)) {
      //     fs.mkdirSync(C.GENERATED_FILENAME_FOLDER);
      //   }
      //   if (fs.existsSync(filename)) {
      //     fs.unlinkSync(filename);
      //   }
      //   fs.writeFileSync(filename, JSON.stringify(minifiedSpeciesData));
      //   console.log('__________________________________________');
      //   console.log(`Complete. File generated: ${filename}`);
    },
    onError: (e) => {
      console.error('Error loading data: ', e);
    },
  });
})();
