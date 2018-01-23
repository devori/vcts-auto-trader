import sinon from 'sinon';
import {expect, should} from 'chai';
import * as trader from '../../src/trader';
import * as rule from '../../src/trader/rule';
import * as vctsApi from '../../src/api/vcts';

describe('trader/index', function () {

    const ACCOUNT_ID = 'account';
    const MARKET = 'market';
    const BASE = 'base';
    const COIN_A = 'A';
    const COIN_B = 'B';
    const COIN_C = 'C';

    before(() => {
        sinon.stub(vctsApi, 'syncAssets').resolves({});
        sinon.stub(vctsApi, 'getExchangeInfo').resolves({
            [BASE]: {
                [COIN_A]: {
                    rate: { step: 0.001 },
                    units: { step: 0.001}
                }
            }
        });
        sinon.stub(vctsApi, 'getTickers').resolves({
            [COIN_A]: 'ticker',
            [COIN_B]: 'ticker',
            [COIN_C]: 'ticker',
        });
        sinon.stub(vctsApi, 'getAssets').resolves({
            [BASE]: {
                [BASE]: [{units: 0.1}],
                [COIN_A]: [{units: 2}],
                [COIN_B]: [{units: 2}],
                [COIN_C]: [{units: 2}],
            },
        });
    });

    after(() => {
        vctsApi.syncAssets.restore();
        vctsApi.getExchangeInfo.restore();
        vctsApi.getTickers.restore();
        vctsApi.getAssets.restore();
    });

    describe('trade', () => {
        let coins;

        beforeEach(() => {
            coins = {
                minUnits: 0.01,
                maxUnits: 0.1,
                coins: [
                    {
                        name: COIN_A,
                        purchase: {
                            inUse: true,
                        },
                        sale: {
                            inUse: true,
                        }
                    },
                    {
                        name: COIN_B,
                        purchase: {
                            inUse: true,
                        },
                        sale: {
                            inUse: true,
                        }
                    },
                    {
                        name: COIN_C,
                        purchase: {
                            inUse: false,
                        },
                        sale: {
                            inUse: false,
                        }
                    }
                ]
            };

            sinon.stub(vctsApi, 'buy').resolves({});
            sinon.stub(vctsApi, 'sell').resolves({});
            sinon.stub(rule, 'judgeForPurchase')
                .withArgs(BASE, COIN_A).returns({units: 2.0012, rate: 0.1012,})
                .withArgs(BASE, COIN_B).returns({units: 0.1, rate: 0.01,});
            sinon.stub(rule, 'judgeForSale')
                .withArgs(BASE, COIN_A).returns({units: 2.0012, rate: 0.1012,})
                .withArgs(BASE, COIN_B).returns({units: 0.1, rate: 0.01,});
        });

        afterEach(() => {
            vctsApi.buy.restore();
            vctsApi.sell.restore();
            rule.judgeForPurchase.restore();
            rule.judgeForSale.restore();
        });

        describe('buy', () => {
            it('should call rule.judgeForPurchase with tickers of coin and options', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(rule.judgeForPurchase.calledOnce).to.be.true;
                    expect(rule.judgeForPurchase.calledWithExactly(
                        BASE,
                        COIN_A,
                        {
                            tickers: ['ticker'],
                            assets: [{units: 2}],
                            maxBaseUnits: 0.1,
                        }
                    )).to.be.true;
                    done();
                });
            });

            it('should call vctsApi.buy when units * rate >= minUnits', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(vctsApi.buy.calledOnce).to.be.true;
                    done();
                });
            });

            it('should call vctsApi.buy with maxUnits info when units * rate > maxUnits', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(vctsApi.buy.calledWith(ACCOUNT_ID, MARKET, BASE, COIN_A, 0.988, 0.101)).to.be.true;
                    done();
                });
            });

            it('should not call buy api when base unit is less than min units', done => {
                coins.minUnits = 0.15;
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(vctsApi.buy.called).to.be.false;
                    done();
                });
            });
        });

        describe('sell', () => {
            it('should call rule.judgeForSale with tickers of coin and options', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(rule.judgeForSale.calledTwice).to.be.true;
                    expect(rule.judgeForSale.firstCall.calledWithExactly(
                        BASE,
                        COIN_A,
                        {
                            tickers: ['ticker'],
                            assets: [{units: 2}],
                        }
                    )).to.be.true;
                    done();
                });
            });

            it('should call vctsApi.sell when units * rate >= minUnits', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(vctsApi.sell.calledOnce).to.be.true;
                    done();
                });
            });

            it('should call vctsApi.sell regardless of maxUnits', done => {
                trader.trade(ACCOUNT_ID, MARKET, BASE, coins).then(() => {
                    expect(vctsApi.sell.calledWith(ACCOUNT_ID, MARKET, BASE, COIN_A, 2.001, 0.101)).to.be.true;
                    done();
                });
            });
        });
    });
});
