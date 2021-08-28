import logger from '../../util/logger';

export function judgeForPurchase(base, vcType, {tickers, assets = [], maxBaseUnits}, { rateForPurchase }) {
    logger.verbose('[Rule-Exact] Judgement for purchase');
    const lastTicker = tickers[tickers.length - 1];
    let threshold = lastTicker.ask * 1.001;
    if (assets.length) {
        const minAssetPrice = assets.reduce((min, cur) => {
            return min < cur.rate ? min : cur.rate
        }, 1000000000);
        threshold = minAssetPrice * (1 - rateForPurchase);
    }

    logger.verbose(`${lastTicker.ask}(ticker) ${threshold}(threshold)`);
    let result = {rate: 0, units: 0};
    if (lastTicker.ask >= threshold) {
        return result;
    }
    result.rate = Math.trunc(threshold * 100000000) / 100000000;
    result.units = maxBaseUnits / result.rate;
    result.units = Math.trunc(result.units * 100000000) / 100000000;

    return result;
}

export function judgeForSale(base, vcType, {tickers, assets = []}, { rateForSale }) {
    logger.verbose('[Rule-Exact] Judgement for sale');
    const lastTicker = tickers[tickers.length - 1];
    const threshold = lastTicker.bid / (1 + rateForSale);
    const totalUnits = assets.reduce((acc, a) => acc + a.units, 0);
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
        rate: Math.trunc(threshold * 100000000) / 100000000,
    };
}
