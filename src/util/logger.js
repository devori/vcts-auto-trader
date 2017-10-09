import fs from 'fs'
import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import { LOG_DIR } from '../env';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

let logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.DailyRotateFile)({
      filename: `${LOG_DIR}/app.log`,
      datePattern: 'yyyy-MM-dd.',
      prepend: true,
      level: 'debug',
      timestamp: (() => new Date().toLocaleString())
    })
  ]
});

export default logger;
