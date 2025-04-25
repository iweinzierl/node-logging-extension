'use strict';

const {createLogger, format, transports} = require('winston');
const winston = require('winston');
const path = require('path');
const kleur = require('kleur');
kleur.enabled = true;

let logger = null;

const customFormat = format.printf(({level, message, timestamp, file}) => {
  let coloredLevel;
  switch (level) {
    case 'debug':
      coloredLevel = kleur.gray('[DEBUG]');
      break;
    case 'info':
      coloredLevel = kleur.white('[INFO]');
      break;
    case 'warn':
      coloredLevel = kleur.yellow('[WARN]');
      break;
    case 'error':
      coloredLevel = kleur.red('[ERROR]');
      break;
    default:
      coloredLevel = level;
  }

  return `${kleur.white(`[${timestamp}]`)} ${coloredLevel} ${kleur.cyan(`[${file}]`)} ${message}`;
});

function getLogPath(directory, filename) {
  return path.join(directory, filename);
}

const addFileMetadata = format((info) => {
  const stack = new Error().stack.split('\n');
  const callerLine = stack[stack.length-1] || '';
  const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || callerLine.match(/at\s+(.*):(\d+):(\d+)/);

  if (match) {
    // Extract the file name from the full path
    const fullPath = match[2] || match[1];
    info.file = fullPath ? path.basename(fullPath) : 'unknown';
  } else {
    info.file = 'unknown';
  }

  return info; // Ensure the modified info object is returned
})();

module.exports = function (opts = {}) {
  const defaults = {
    level: 'debug',
    logPath: './logs/',
    logFileBaseName: 'out',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  };
  const options = {...defaults, ...opts};

  if (logger !== null) {
    return logger;
  }

  logger = createLogger({
    level: options.level,
    format: format.combine(
      format.timestamp({format: options.dateTimeFormat}),
      addFileMetadata, // Add the file metadata to the log entry
      customFormat,
      winston.format.errors({stack: true})
    ),
    transports: [
      new transports.Console(),
      new transports.File({filename: getLogPath(options.logPath, options.logFileBaseName + '-out.log'), level: options.level}),
      new transports.File({filename: getLogPath(options.logPath, options.logFileBaseName + '-err.log'), level: 'error'}),
    ],
  });

  return logger;
};