import path from 'path'

let logDirectory = process.env.LOG_DIR;
if (!logDirectory) {
    logDirectory = path.resolve(__dirname, '../logs');
}
export const LOG_DIR = path.resolve(logDirectory);

export default {
    VCTS_BASE_URL: process.env.VCTS_BASE_URL || 'http://localhost:8000',
};
