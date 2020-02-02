import * as rule from './rule';
import * as vctsApi from '../api/vcts';
import logger from '../util/logger';
import math from '../util/math';

export function trade(accountId, market, base, options) {
    logger.info(`Auto-Trader Start [${market} - ${base}]`);
    return Promise.resolve().then(() => {
        return vctsApi.syncAssets(accountId, market, base, base);
    }).then(() => {
        return vctsApi.getTickers(market, base);
    }).then(tickers => {
        return vctsApi.getAssets(accountId, market).then(assets => ({
            tickers,
            assets
        }));
    }).then(({tickers, assets}) => {
        return vctsApi.getExchangeInfo(market).then(exchangeInfo => ({
            tickers,
            assets,
            exchangeInfo
        }));
    }).then(({tickers, assets, exchangeInfo}) => {
        logger.info('Trader - Buy');
        let baseAssetUnits = assets[base][base][0].units;
        return options.coins.filter(coin => coin.purchase.inUse).reduce((p, coin) => {
            logger.info(`Trader - Purchase: ${coin.name} Start`)
            try {
                if (baseAssetUnits < options.minUnits) {
                    return p;
                }

                const {name} = coin;
                let {units, rate} = rule.judgeForPurchase(base, name, {
                    tickers: [tickers[name]],
                    assets: assets[base][name],
                    maxBaseUnits: options.maxUnits
                }, options.rule.options);
                logger.verbose(`Purchase Judgement[${name}] : ${units}(units) ${rate}(rate)`);
                if (units * rate > options.maxUnits) {
                    units = options.maxUnits / rate;
                }

                if (exchangeInfo[base] && exchangeInfo[base][name]) {
                    const {rate: {step: rateStep}, units: {step: unitsStep}} = exchangeInfo[base][name];
                    units = math.truncRemainder(units, unitsStep);
                    rate = math.truncRemainder(rate, rateStep);
                }

                if (units * rate < options.minUnits) {
                    return p;
                }

                baseAssetUnits -= units * rate;

                return p.then(vctsApi.buy(accountId, market, base, name, units, rate));
            } catch (e) {
                logger.error(e);
                return p;
            }
        }, Promise.resolve()).then(() => {
            logger.info('Trader - Buy End');
            return {
                tickers,
                exchangeInfo
            };
        });
    }).then(({tickers, exchangeInfo}) => {
        return vctsApi.getAssets(accountId, market).then(assets => ({
            tickers,
            assets,
            exchangeInfo
        }));
    }).then(({tickers, assets, exchangeInfo}) => {
        logger.info('Trader - Sell');
        return options.coins.filter(coin => coin.sale.inUse).reduce((p, coin) => {
            logger.info(`Trader - Sell: ${coin.name} Start`)
            try {
                const {name} = coin;
                let {units, rate} = rule.judgeForSale(base, name, {
                    tickers: [tickers[name]],
                    assets: assets[base][name],
                }, options.rule.options);
                logger.verbose(`Sale Judgement[${name}] : ${units}(units) ${rate}(rate)`);
                if (units * rate < options.minUnits) {
                    return p;
                }

                if (exchangeInfo[base] && exchangeInfo[base][name]) {
                    const {rate: {step: rateStep}, units: {step: unitsStep}} = exchangeInfo[base][name];
                    units = math.truncRemainder(units, unitsStep);
                    rate = math.truncRemainder(rate, rateStep);
                }

                return p.then(vctsApi.sell(accountId, market, base, name, units, rate));
            } catch (e) {
                logger.error(e);
                return p;
            }
        }, Promise.resolve()).then(() => {
            logger.info('Trader - Sale End');
        });
    }).then(() => {
        logger.info(`Auto-Trader End`);
    }).catch(e => {
        logger.error(e);
    });
}
