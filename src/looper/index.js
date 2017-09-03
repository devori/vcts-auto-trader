import trader from '../trader'

const LOOPERS = {};

export function run(accountId, market, interval) {
  if (!accountId || !market || !interval) {
    return Promise.reject();
  }
  if (LOOPERS[accountId] && LOOPERS[accountId][market]) {
    return Promise.reject('duplicated');
  }
  LOOPERS[accountId] = LOOPERS[accountId] || {};
  LOOPERS[accountId][market] = {
    interval
  };
  return Promise.resolve().then(() => {
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
    LOOPERS[accountId][market] = null;
  }
  return Promise.resolve();
}

export function list(accountId) {
  let result = [];
  if (!LOOPERS[accountId]) {
    return result;
  }
  for (let market in LOOPERS[accountId]) {
    result.push({
      market,
      interval: LOOPERS[accountId][market].interval
    });
  }
  return result;
}
