const MAX_UNIT_COUNT = {
  BTC: 0.1
}

export function judgeForPurchase(base, vcType, tickers, assets) {
  let minAssetPrice = assets.reduce((min, cur) => {
    return min < cur.price ? min : cur.price
  }, 1000000000);

  let lastTicker = tickers[tickers.length - 1];

  let result = { rate: 0, units: 0 };
  if (lastTicker.high >= minAssetPrice * 0.93) {
    return result;
  }
  result.rate = Math.trunc(lastTicker.high * 1.02 * 100000000) / 100000000;
  result.units = MAX_UNIT_COUNT[base];

  return result;
}

export function judgeForSale(base, vcType, tickers, assets) {
  let lastTicker = tickers[tickers.length - 1];
  let threshold =  lastTicker.low * 0.93;
  let totalUnits = assets.reduce((acc, a) => acc + a.units, 0);
  if (totalUnits <= 0.1) {
    return { units: 0, rate: 1000000000 };
  }

  let units = assets.reduce((acc, a) => {
    if (a.price < threshold) {
      acc += a.units;
    }
    return acc;
  }, 0);

  if (totalUnits - units < 0.01) {
    units = totalUnits - 0.01;
  }

  return {
    units,
    rate: lastTicker.low * 0.98
  };
}
