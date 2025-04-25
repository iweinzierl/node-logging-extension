'use strict';

const {createLogger, format, transports} = require('winston');
const winston = require('winston');
const path = require('path');
const kleur = require('kleur');
kleur.enabled = true;

let logger = null;

const customFormat = format.printf(({level, message, timestamp}) => {
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

  return `${kleur.white(`[${timestamp}]`)} ${coloredLevel} ${message}`;
});

function getLogPath(directory, filename) {
  return path.join(directory, filename);
}

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