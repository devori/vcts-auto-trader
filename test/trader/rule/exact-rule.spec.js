import {expect, should} from 'chai';
import * as rule from '../../../src/trader/rule/exact-rule';

describe('trader/rule/exact-rule', function () {
    describe('judgeForPurchase', () => {
        const MAX_BASE_UNITS = 0.01;

        describe('when base is BTC and options.rateForPurchase is 7%', () => {
            it('when last ticker ask rate < 93% of min rate asset, return 93% rate and units', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 92}],
                    assets: [{rate: 100}],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    rateForPurchase: 0.07
                });
                expect(result.units).to.equal(Math.trunc(100000000 * (MAX_BASE_UNITS / 93)) / 100000000);
                expect(result.rate).to.equal(93);
            });
            it('when last ticker ask rate >= 93% of min rate asset, return 0 units', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 93}],
                    assets: [{rate: 100}],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    rateForPurchase: 0.07
                });
                expect(result.units).to.equal(0);
            });
            it('when assets are empty, should return units units and ask', () => {
                const result = rule.judgeForPurchase('BTC', 'ETH', {
                    tickers: [{ask: 92}],
                    assets: [],
                    maxBaseUnits: MAX_BASE_UNITS,
                }, {
                    rateForPurchase: 0.07
                });
                expect(result.units).to.equal(Math.trunc(100000000 * MAX_BASE_UNITS / (92 * 1.001)) / 100000000);
                expect(result.rate).to.equal(92.09199999);
            });
        });
    });

    describe('judgeForSale', () => {
        describe('when base is BTC and options.rateForSale is 7%', () => {
            it('when assets are empty, should return 0 units', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 92}],
                    assets: [],
                }, {
                    rateForSale: 0.07
                });
                expect(result.units).to.equal(0);
            });

            it('when last ticker is more than assets * ratePoint, return units and rate', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 108}],
                    assets: [
                        {rate: 99, units: 4},
                        {rate: 100, units: 4},
                        {rate: 101, units: 4},
                    ]
                }, {
                    rateForSale: 0.07
                });
                expect(result.rate).to.equal(100.93457943);
                expect(result.units).to.equal(8);
            });

            it('when return units is same to total unit, return units except 0.01 units', () => {
                const result = rule.judgeForSale('BTC', 'ETH', {
                    tickers: [{bid: 100}],
                    assets: [
                        {rate: 92, units: 1},
                    ]
                }, {
                    rateForSale: 0.07
                });
                expect(result.units).to.equal(0.99);
            });
        });
    });
});
