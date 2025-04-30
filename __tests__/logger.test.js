const { createLogger } = require('../index');
const fs = require('fs');
const path = require('path');

describe('createLogger', () => {
  const logPath = './logs/';
  const logFileBaseName = 'test-log';
  const logger = createLogger({
    level: 'debug',
    logPath: logPath,
    logFileBaseName: logFileBaseName,
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  });

  afterAll(() => {
    // Clean up log files after tests
    const outLogPath = path.join(logPath, `${logFileBaseName}-out.log`);
    const errLogPath = path.join(logPath, `${logFileBaseName}-err.log`);
    if (fs.existsSync(outLogPath)) fs.unlinkSync(outLogPath);
    if (fs.existsSync(errLogPath)) fs.unlinkSync(errLogPath);
  });

  it('should include file metadata in the log output', (done) => {
    const outLogPath = path.join(logPath, `${logFileBaseName}-out.log`);
    const errLogPath = path.join(logPath, `${logFileBaseName}-err.log`);

    logger.info('Testing file metadata');

    // Wait for logs to be written
    setTimeout(() => {
      expect(fs.existsSync(outLogPath)).toBe(true);
      const outLogContent = fs.readFileSync(outLogPath, 'utf8');
      expect(outLogContent).toContain('[logger.test.js]');
      done();
    }, 200); // Adjust timeout if necessary
  });

  it('should log a debug message', () => {
    const spy = jest.spyOn(logger, 'debug').mockImplementation(() => {});
    logger.debug('This is a debug message');
    expect(spy).toHaveBeenCalledWith('This is a debug message');
    spy.mockRestore();
  });

  it('should log an info message', () => {
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    logger.info('This is an info message');
    expect(spy).toHaveBeenCalledWith('This is an info message');
    spy.mockRestore();
  });

  it('should log a warning message', () => {
    const spy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    logger.warn('This is a warning message');
    expect(spy).toHaveBeenCalledWith('This is a warning message');
    spy.mockRestore();
  });

  it('should log an error message', () => {
    const spy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    logger.error('This is an error message');
    expect(spy).toHaveBeenCalledWith('This is an error message');
    spy.mockRestore();
  });

  it('should write logs to the correct files', (done) => {
    const outLogPath = path.join(logPath, `${logFileBaseName}-out.log`);
    const errLogPath = path.join(logPath, `${logFileBaseName}-err.log`);

    logger.info('This is an info message');
    logger.error('This is an error message');

    // Wait for logs to be written
    setTimeout(() => {
      expect(fs.existsSync(outLogPath)).toBe(true);
      expect(fs.existsSync(errLogPath)).toBe(true);

      const outLogContent = fs.readFileSync(outLogPath, 'utf8');
      const errLogContent = fs.readFileSync(errLogPath, 'utf8');

      expect(outLogContent).toContain('This is an info message');
      expect(errLogContent).toContain('This is an error message');
      done();
    }, 200); // Adjust timeout if necessary
  });
});