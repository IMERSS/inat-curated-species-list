import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { formatNum, splitStringByComma } from './helpers';

const { combine, label, timestamp, printf } = format;

export const initLogger = (temporaryFolder: string) => {
  const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });

  // label({ label: 'right meow!' })
  return createLogger({
    format: combine(timestamp(), myFormat),
    transports: [new transports.File({ filename: 'data.log', level: 'info', dirname: temporaryFolder })],
  });
};

export const logPacket = (packetNum: number, tempFolder: string, resp: any) => {
  fs.mkdirSync(tempFolder, { recursive: true });
  fs.writeFileSync(path.resolve(tempFolder, `packet-${packetNum}.json`), JSON.stringify(resp, null, '\t'), 'utf-8');
};

export const clearTempFolder = (tempFolder: string) => {
  try {
    fs.unlinkSync(tempFolder);
  } catch (e) {}
};
