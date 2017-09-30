import async from 'async';
import rule from './rule';
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
      if (baseAsset.units <= 0) {
        return p;
      }
      let currentAssets = assets[BASE][vcType] || [];
      let judgement = rule.judgeForPurchase(vcType, [tickers[vcType]], currentAssets);
      if (judgement.units === 0) {
        return p;
      }
      baseAsset.units -= judgement.rate * judgement.units;
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
      return p.then(() => vctsApi.sell(accountId, market, base, vcType, judgement.rate, judgeForSale.units));
    }, Promise.resolve());
  });
}
