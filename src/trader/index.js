import async from 'async';
import * as rule from './rule';
import * as vctsApi from '../api/vcts';
import env from '../env';

const BASE = 'BTC';

export function trade(accountId, market) {
  console.log(`[${Date()}] Auto-Trader`);
  return Promise.resolve().then(() => {
    return vctsApi.syncAssets(accountId, market, BASE, BASE);
  }).then(() => {
    return vctsApi.getTickers(market, BASE);
  }).then(tickers => {
    return vctsApi.getAssets(accountId, market).then(assets => ({
      tickers,
      assets
    }));
  }).then(({ tickers, assets }) => {
    let baseAsset = assets[BASE][BASE][0];

    return env.VCTYPES.reduce((p, vcType) => {
      if (!tickers[vcType]) {
        return p;
      }
      if (baseAsset.units <= 0) {
        return p;
      }
      let currentAssets = assets[BASE][vcType] || [];
      let judgement = rule.judgeForPurchase(BASE, vcType, [tickers[vcType]], currentAssets);
      if (judgement.units * judgement.rate < 0.0001) {
        return p;
      }
      baseAsset.units -= judgement.rate * judgement.units;
      return p.then(() => vctsApi.buy(accountId, market, BASE, vcType, judgement.rate, judgement.units));
    }, Promise.resolve()).then(() => {
      return tickers;
    });
  }).then(tickers => {
    return vctsApi.getAssets(accountId, market).then(assets => ({
      tickers,
      assets
    }));
  }).then(({ tickers, assets }) => {
    return env.VCTYPES.reduce((p, vcType) => {
      if (!tickers[vcType]) {
        return p;
      }
      let currentAsset = assets[BASE][vcType];
      if (!currentAsset || currentAsset.length === 0) {
        return p;
      }
      let judgement = rule.judgeForSale(BASE, vcType, [tickers[vcType]], currentAsset);
      if (judgement.rate * judgement.units < 0.0001) {
        return p;
      }
      return p.then(() => vctsApi.sell(accountId, market, BASE, vcType, judgement.rate, judgement.units));
    }, Promise.resolve());
  }).catch(e => {
    console.log(e);
  });
}
