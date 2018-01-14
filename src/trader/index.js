import * as rule from './rule';
import * as vctsApi from '../api/vcts';
import logger from '../util/logger'

export function trade(accountId, market, base, options) {
    logger.info(`Auto-Trader Start`);
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
        logger.info('Trader - Buy');
        let baseAssetUnits = assets[base][base][0].units;
        return options.coins.filter(coin => coin.purchase.inUse).reduce((p, coin) => {
            if (baseAssetUnits < options.coins.minUnits) {
                return p;
            }

            const {name} = coin;
            let {units, rate} = rule.judgeForPurchase(base, name, [tickers[name]], assets[base][name], {maxBaseUnits: options.maxUnits});
            if (units * rate > options.maxUnits) {
                units = options.maxUnits / rate;
            }

            if (units * rate < options.minUnits) {
                return p;
            }

            baseAssetUnits -= units * rate;

            return p.then(vctsApi.buy(accountId, market, base, name, units, rate));
        }, Promise.resolve()).then(() => {
            logger.info('Trader - Buy End');
            return tickers;
        });
    }).then(tickers => {
        return vctsApi.getAssets(accountId, market).then(assets => ({
            tickers,
            assets
        }));
    }).then(({tickers, assets}) => {
        logger.info('Trader - Sell');
        return options.coins.filter(coin => coin.sale.inUse).reduce((p, coin) => {
            const {name} = coin;
            let {units, rate} = rule.judgeForSale(base, name, [tickers[name]], assets[base][name]);

            if (units * rate < options.minUnits) {
                return p;
            }

            return p.then(vctsApi.sell(accountId, market, base, name, units, rate));
        }, Promise.resolve()).then(() => {
            logger.info('Trader - Sale End');
        });
    }).then(() => {
        logger.info(`Auto-Trader End`);
    }).catch(e => {
        logger.error(e);
    });
}
