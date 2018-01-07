import * as vctsApi from '../api/vcts';
import * as trader from '../trader';

const LOOPERS = {};

export function run(accountId, market, options) {
  const { interval, unitsPerPurchase } = options;
  if (!accountId || !market || !interval || !unitsPerPurchase) {
    return Promise.reject();
  }
  if (LOOPERS[accountId] && LOOPERS[accountId][market]) {
    return Promise.reject(`${accountId} - ${market} duplicated`);
  }
  return vctsApi.findUser(accountId).then(user => {
    if (!user) {
      throw 'id does not exist';
    }
    LOOPERS[accountId] = LOOPERS[accountId] || {};
    LOOPERS[accountId][market] = {
      interval,
      unitsPerPurchase
    };
    LOOPERS[accountId][market].id = setInterval(() => {
      trader.trade(accountId, market);
    }, interval);
    return {
      market,
      interval
    };
  });
}

export function stop(accountId, market) {
  if (LOOPERS[accountId] && LOOPERS[accountId][market]) {
    clearInterval(LOOPERS[accountId][market].id);
    delete LOOPERS[accountId][market];
  }
}

export function list(accountId) {
  let result = {};
  if (!LOOPERS[accountId]) {
    return result;
  }
  for (let market in LOOPERS[accountId]) {
    result[market] = {
      interval: LOOPERS[accountId][market].interval,
      unitsPerPurchase: LOOPERS[accountId][market].unitsPerPurchase
    };
  }
  return result;
}
