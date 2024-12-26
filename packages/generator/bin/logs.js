'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.clearTempFolder = exports.logPacket = exports.initLogger = void 0;
var fs_1 = __importDefault(require('fs'));
var path_1 = __importDefault(require('path'));
var winston_1 = require('winston');
var combine = winston_1.format.combine,
  label = winston_1.format.label,
  timestamp = winston_1.format.timestamp,
  printf = winston_1.format.printf;
var initLogger = function (temporaryFolder) {
  var myFormat = printf(function (_a) {
    var level = _a.level,
      message = _a.message,
      label = _a.label,
      timestamp = _a.timestamp;
    return ''.concat(timestamp, ' [').concat(level, ']: ').concat(message);
  });
  // label({ label: 'right meow!' })
  return (0, winston_1.createLogger)({
    format: combine(timestamp(), myFormat),
    transports: [new winston_1.transports.File({ filename: 'generator.log', level: 'info', dirname: temporaryFolder })],
  });
};
exports.initLogger = initLogger;
var logPacket = function (packetNum, tempFolder, resp) {
  fs_1.default.mkdirSync(tempFolder, { recursive: true });
  fs_1.default.writeFileSync(
    path_1.default.resolve(tempFolder, 'packet-'.concat(packetNum, '.json')),
    JSON.stringify(resp, null, '\t'),
    'utf-8',
  );
};
exports.logPacket = logPacket;
var clearTempFolder = function (tempFolder) {
  try {
    fs_1.default.unlinkSync(tempFolder);
  } catch (e) {}
};
exports.clearTempFolder = clearTempFolder;
