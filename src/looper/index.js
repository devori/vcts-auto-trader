import defaultsDeep from 'lodash/defaultsDeep';
import * as vctsApi from '../api/vcts';
import * as trader from '../trader';

const LOOPERS = {};

export function run(accountId, market, base, options) {
    const {interval, coins} = options;

    if (!accountId || !market || !base || !interval || !coins) {
        return Promise.reject();
    }

    if (LOOPERS[accountId] && LOOPERS[accountId].some(looper => looper.market === market && looper.base === base)) {
        return Promise.reject(`${accountId} - ${market} duplicated`);
    }

    return vctsApi.findUser(accountId).then(user => {
        if (!user) {
            throw 'id does not exist';
        }

        LOOPERS[accountId] = LOOPERS[accountId] || [];
        LOOPERS[accountId].push({
            market,
            base,
            interval,
            coins: defaultsDeep([], coins),
            id: setInterval(() => {
                trader.trade(accountId, market, base, LOOPERS[accountId][market][base].coins);
            }, interval)
        });

        return true;
    });
}

export function stop(accountId, market, base) {
    if (LOOPERS[accountId]) {
        const index = LOOPERS[accountId].findIndex(looper => looper.market === market && looper.base === base);
        if (index >= 0) {
            clearInterval(LOOPERS[accountId][index].id);
            LOOPERS[accountId].splice(index, 1);
        }
    }
}

export function list(accountId) {
    let result = [];
    if (!LOOPERS[accountId]) {
        return result;
    }
    return LOOPERS[accountId].map(looper => defaultsDeep({}, looper));
}
