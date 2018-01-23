import {expect, should} from 'chai';
import * as rule from '../../../src/trader/rule';

describe('trader/rule/index', function () {
    describe('judgeForPurchase', () => {
        const MAX_BASE_UNITS = 0.01;

        describe('when base is BTC and options.ratePoint is 7%', () => {
            it('when last ticker ask rate < 93% of min rate asset, return BTC 0.01units and ask * 1.02', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 92}],
                    assets: [{rate: 100}],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    rateForPurchase: 0.07
                });
                expect(result.units).to.equal(Math.trunc(100000000 * MAX_BASE_UNITS / (92 * 1.02)) / 100000000);
                expect(result.rate).to.equal(92 * 1.02);
            });
            it('when last ticker ask rate >= 93% of min rate asset, return 0 units', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 93}],
                    assets: [{rate: 100}],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    ratePoint: 0.07
                });
                expect(result.units).to.equal(0);
            });
            it('when assets are empty, should return BTC 0.01units units and ask * 1.02', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 92}],
                    assets: [],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    rateForSale: 0.07
                });
                expect(result.units).to.equal(Math.trunc(100000000 * MAX_BASE_UNITS / (92 * 1.02)) / 100000000);
                expect(result.rate).to.equal(92 * 1.02);
            });
        });
    });

    describe('judgeForSale', () => {
        describe('when base is BTC and options.ratePoint is 7%', () => {
            it('when assets are empty, should return 0 units', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 92}],
                    assets: [],
                }, {
                    ratePoint: 0.07
                });
                expect(result.units).to.equal(0);
            });

            it('when assets that are less than last ticker rate * 0.93 exist, return units of assets and bid * 0.98 rate', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 100}],
                    assets: [
                        {rate: 92, units: 1},
                        {rate: 92, units: 2},
                        {rate: 92, units: 3},
                        {rate: 93, units: 4}
                    ]
                }, {
                    ratePoint: 0.07
                });
                expect(result.rate).to.equal(98);
                expect(result.units).to.equal(6);
            });

            it('when return units is same to total unit, return units except 0.01 units', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 100}],
                    assets: [
                        {rate: 92, units: 1},
                        {rate: 92, units: 2},
                        {rate: 92, units: 3}
                    ]
                }, {
                    ratePoint: 0.07
                });
                expect(result.units).to.equal(5.99);
            });
        });
    });
});
