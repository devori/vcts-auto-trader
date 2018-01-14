import fs from 'fs';
import path from 'path';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

if (!fs.existsSync(path.resolve(__dirname, '../../data'))) {
    fs.mkdirSync(path.resolve(__dirname, '../../data'));
}

const adapter = new FileSync('./data/auto-traders.json', {
    defaultValue: {}
});
const db = lowdb(adapter);

export function getAutoTraders(accountId) {
    if (!db.has(accountId).value()) {
        return [];
    }

    return db.get(accountId).get('traders').cloneDeep().value();
}

export function saveAutoTraderInfo(accountId, market, base, info) {
    if (!db.has(accountId).value()) {
        db.set(accountId, {traders: []}).write();
    }

    const traders = db.get(accountId).get('traders');
    traders.remove({market, base}).write();
    traders.push({market, base, ...info}).write();
    return traders.find({market, base}).cloneDeep().value();
}

export default {
    getAutoTraders,
    saveAutoTraderInfo,
};
