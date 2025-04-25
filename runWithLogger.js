const {createLogger} = require('./index');

const logPath = './logs/';
const logFileBaseName = 'test-log';
const logger = createLogger({
  level: 'debug',
  logPath: logPath,
  logFileBaseName: logFileBaseName,
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
});

logger.debug('Hello World!');
 