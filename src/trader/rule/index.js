import logger from '../../util/logger';

export function judgeForPurchase(base, vcType, tickers, assets = [], options) {
  logger.verbose('Judgement for purchase');
  let minAssetPrice = assets.reduce((min, cur) => {
    return min < cur.rate ? min : cur.rate
  }, 1000000000);

  let lastTicker = tickers[tickers.length - 1];

  let result = { rate: 0, units: 0 };
  logger.verbose(`${lastTicker.ask}(ticker) ${minAssetPrice}(minAsset)`);
  if (lastTicker.ask >= minAssetPrice * 0.93) {
    return result;
  }
  result.rate = Math.trunc(lastTicker.ask * 1.02 * 100000000) / 100000000;
  result.units = options.maxBaseUnits / result.rate;
  result.units = Math.trunc(result.units * 100000000) / 100000000;

  return result;
}

export function judgeForSale(base, vcType, tickers, assets = []) {
  logger.verbose('Judgement for sale');
  let lastTicker = tickers[tickers.length - 1];
  let threshold =  lastTicker.bid * 0.93;
  let totalUnits = assets.reduce((acc, a) => acc + a.units, 0);
  let units = assets.reduce((acc, a) => {
    if (a.rate < threshold) {
      acc += a.units;
    }
    return acc;
  }, 0);

  logger.verbose(`${totalUnits}(total) ${units}(units) ${threshold}(threshold)`);
  if (totalUnits <= units) {
    units -= 0.01;
  }

  if (units < 0) {
    units = 0;
  }

  return {
    units,
    rate: lastTicker.bid * 0.98
  };
}
