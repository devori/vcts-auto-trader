import async from 'async';
import * as rule from './rule';
import * as vctsApi from '../api/vcts';
import env from '../env';
import logger from '../util/logger';

const BASE = 'BTC';

export function trade(accountId, market, options) {
  logger.info(`Auto-Trader Start`);
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

    logger.info('Purchase Start')
    return env.VCTYPES.reduce((p, vcType) => {
      logger.verbose(`${vcType} - ${baseAsset.units}(${BASE})`);
      if (!tickers[vcType]) {
        logger.verbose('There is no ticker');
        return p;
      }
      if (baseAsset.units < 0.0001) {
        logger.verbose(`${BASE} is less than 0.0001`);
        return p;
      }
      let currentAssets = assets[BASE][vcType] || [];
      let judgement = rule.judgeForPurchase(BASE, vcType, [tickers[vcType]], currentAssets, options);
      logger.verbose(`${judgement.units}(units) * ${judgement.rate}(rate) = ${judgement.units * judgement.rate}`)
      if (judgement.units * judgement.rate < 0.0001) {
        logger.verbose('units * rate is less than 0.0001');
        return p;
      }
      baseAsset.units -= judgement.rate * judgement.units;
      return p.then(() => vctsApi.buy(accountId, market, BASE, vcType, judgement.rate, judgement.units));
    }, Promise.resolve()).then(() => {
      logger.info('Purchase End')
      return tickers;
    });
  }).then(tickers => {
    return vctsApi.getAssets(accountId, market).then(assets => ({
      tickers,
      assets
    }));
  }).then(({ tickers, assets }) => {
    logger.info('Sale Start')
    return env.VCTYPES.reduce((p, vcType) => {
      logger.verbose(`${vcType} ----------`);
      if (!tickers[vcType]) {
        logger.verbose('There is no ticker');
        return p;
      }
      let currentAsset = assets[BASE][vcType];
      if (!currentAsset || currentAsset.length === 0) {
        logger.verbose('There is no asset');
        return p;
      }
      let judgement = rule.judgeForSale(BASE, vcType, [tickers[vcType]], currentAsset);
      logger.verbose(`${judgement.units}(units) * ${judgement.rate}(rate) = ${judgement.units * judgement.rate}`)
      if (judgement.rate * judgement.units < 0.0001) {
        logger.verbose('units * rate is less than 0.0001');
        return p;
      }
      return p.then(() => vctsApi.sell(accountId, market, BASE, vcType, judgement.rate, judgement.units));
    }, Promise.resolve()).then(() => {
      logger.info('Sale End');
    });
  }).then(() => {
    logger.info(`Auto-Trader End`);
  }).catch(e => {
    logger.error(e);
  });
}
