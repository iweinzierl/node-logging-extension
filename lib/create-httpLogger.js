const {createLogger, format, transports} = require('winston');
const kleur = require('kleur');
const path = require('path');

let httpLogger = null;

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

function getColorByStatus(status) {
  if (status >= 500) return kleur.red;
  if (status >= 400) return kleur.yellow;
  return kleur.green;
}

function pad(value, length, alignRight = false) {
  return alignRight ? value.toString().padStart(length) : value.toString().padEnd(length);
}

function formatLogLine({ip = '-', method = '-', url = '-', status = 0, time = '0.0', size = '? kB'}) {
  const color = getColorByStatus(status);
  const line = [
    kleur.cyan(pad(ip, 30)),
    kleur.magenta(pad(method, 7)),
    kleur.white(pad(url, 30)),
    color(pad(status, 3, true)),
    kleur.white(pad(`${time}ms`, 8, true)),
    kleur.white(pad(`${size}kB`, 8, true)),
  ].join(' ');

  return line;
}

function getLogPath(directory, filename) {
  return path.join(directory, filename);
}

function getLogLevel(status) {
  if (status >= 400 && status < 500) {
    return 'warn';
  } else if (status >= 500) {
    return 'error';
  }
  return 'info';
}

module.exports = function (opts = {}) {
  const defaults = {
    level: 'info',
    logPath: './logs/',
    logFileBaseName: 'app',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  };
  const options = {...defaults, ...opts};

  if (httpLogger !== null) {
    return httpLogger;
  }

  const logger = createLogger({
    level: options.level,
    format: format.combine(
      format.timestamp({format: options.dateTimeFormat}),
      customFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({filename: getLogPath(options.logPath, options.logFileBaseName + '-api.log'), level: options.level}),
    ],
  });

  httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const size = `${Math.round((res.get('Content-Length') || 0) / 1024)}`;
      const logLine = formatLogLine({
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        time: duration,
        size,
      });
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';
      logger.log({
        level: getLogLevel(res.statusCode),
        message: logLine
      });
    });
    next();
  }
  return httpLogger;
};