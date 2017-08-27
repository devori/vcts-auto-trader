function judgeForPurchase(vcType, lastPriceInfo, asset, balance) {
  let minPriceAsset = 1000000000;
  asset.forEach(a => {
    if (a.price < minPriceAsset) {
      minPriceAsset = a.price;
    }
  });

  let units = 0;
  if (lastPriceInfo.lowestAsk < minPriceAsset * 0.93) {
    units = balance / lastPriceInfo.lowestAsk;
  }
  units *= 0.9;

  let rate = lastPriceInfo.lowestAsk * 1.02;
  rate = Math.trunc(rate * 100000000) / 100000000;

  return {
    rate,
    units
  };
}

function judgeForSale(vcType, lastPriceInfo, asset) {
  let thresold = lastPriceInfo.highestBid * 0.93;
  let units = 0;
  let totalUnits = 0;
  asset.forEach(a => {
    totalUnits += a.units;
    if (a.price <= thresold) {
      units += a.units;
    }
  });

  let rate = lastPriceInfo.highestBid * 0.98;
  rate = Math.trunc(rate * 100000000) / 100000000;

  if (asset.length === 1 && units === totalUnits) {
    let restUnits = 0.00001 / rate;
    if (units > restUnits) {
      units -= restUnits;
    }
  }

  return {
    units,
    rate
  };
}

export default {
  judgeForSale, judgeForPurchase
}
