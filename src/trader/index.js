import async from 'async';
import rule from './rule/default';
import * as vctsApi from '../api/vcts';
import { VCTYPES } from '../env';

const BASE = 'BTC';

export function trade(accountId, market) {
  return Promise.resolve().then(() => {
    return vctsApi.getTickers(market);
  }).then(tickers => {
    return vctsApi.getAssets(accountId, market).then(assets => ({
      tickers,
      assets
    }));
  }).then(({ tickers, assets }) => {
    let baseAsset = assets[BASE][BASE][0];

    return VCTYPES.reduce((p, vcType) => {
      let currentAssets = assets[BASE][vcType] || [];
      let judgement = rule.judgeForPurchase(vcType, tickers[vcType], currentAssets, baseAsset);
      let units = Math.trunc(judgement.units * 10000) / 10000;
      if (units * judgement.rate >= 0.0001) {
        return p;
      }
      baseAsset.total -= judgement.rate * judgement.units;
      return p.then(() => vctsApi.buy(accountId, market, base, vcType, judgement.rate, units));
    }, Promise.resolve()).then(() => {
      return tickers;
    });
  }).then(tickers => {
    return vctsApi.getAssets(accountId, market).then(assets => ({
      tickers,
      assets
    }));
  }).then(({ tickers, assets }) => {
    return VCTYPES.reduce((p, vcType) => {
      let currentAsset = assets[BASE][vcType];
      if (!currentAsset || currentAsset.length === 0) {
        return p;
      }
      let judgement = rule.judgeForSale(vcType, tickers[vcType], currentAsset);
      let units = Math.trunc(judgement.units * 10000) / 10000;
      if (units * judgement.rate < 0.0001) {
        return p;
      }
      return p.then(() => vctsApi.sell(accountId, market, base, vcType, judgement.rate, units));
    }, Promise.resolve());
  });
}
