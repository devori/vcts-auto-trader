import sinon from 'sinon';
import {expect, should} from 'chai';
import * as looper from '../../src/looper';
import * as trader from '../../src/trader';
import * as vctsApi from '../../src/api/vcts';

describe('looper/index', function () {
    const NON_EXIST_ACCOUNT_ID = 'non-exist-account-id';
    const ACCOUNT_ID = 'test-account';
    const MARKET = 'poloniex';
    const BASE = 'BTC';
    const INTERVAL = 60 * 1000;

    before(() => {
        sinon.stub(vctsApi, 'findUser')
            .withArgs(ACCOUNT_ID).returns(Promise.resolve({id: ACCOUNT_ID}))
            .withArgs(NON_EXIST_ACCOUNT_ID).returns(Promise.resolve(null));
    });

    describe('run', () => {
        beforeEach(() => {
            sinon.stub(trader, 'trade');
        });

        afterEach(() => {
            trader.trade.restore();
            looper.stop(ACCOUNT_ID, MARKET, BASE);
        });

        it('should return true info when it calls', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                minUnits: 1,
                maxUnits: 2,
                coins: [
                    'hello'
                ],
                rule: {},
            }).then(result => {
                expect(result).to.be.true;
                done();
            });
        });

        it('should call trader with args info when it calls', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: 1,
                minUnits: 1,
                maxUnits: 2,
                coins: [
                    'hello'
                ],
                rule: {
                    name: 'default',
                    options: {
                        rateForPurchase: 0.05,
                        rateForSale: 0.05,
                    },
                },
            }).then(() => {
                setTimeout(() => {
                    expect(trader.trade.calledWith(
                        ACCOUNT_ID,
                        MARKET,
                        BASE,
                        {
                            minUnits: 1,
                            maxUnits: 2,
                            coins: [
                                'hello'
                            ],
                            rule: {
                                name: 'default',
                                options: {
                                    rateForPurchase: 0.05,
                                    rateForSale: 0.05,
                                },
                            },
                        }
                    )).to.be.true;
                    done();
                }, 2);
            });
        });

        it('should raise exception when duplicated run called', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                minUnits: 1,
                maxUnits: 2,
                coins: [],
                rule: {},
            }).then(() => {
                looper.run(ACCOUNT_ID, MARKET, BASE, {
                    interval: INTERVAL,
                    coins: [],
                    rule: {},
                }).catch(err => {
                    expect(err).to.contain('duplicated');
                    done();
                });
            });
        });

        it('should reject when accountId does not exist', done => {
            looper.run(NON_EXIST_ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                minUnits: 1,
                maxUnits: 2,
                coins: [],
                rule: {},
            }).catch(err => {
                expect(err).to.equal('id does not exist');
                done();
            });
        });


        it('should reject when rule does not exist', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                minUnits: 1,
                maxUnits: 2,
                coins: [],
            }).catch(err => {
                expect(err).to.equal('error');
                done();
            });
        });
    });

    describe('stop', () => {
        it('should not raise exception when looper is not running', done => {
            looper.stop(ACCOUNT_ID, MARKET, BASE);
            done();
        });
    });

    describe('list', () => {
        before(done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                minUnits: 1,
                maxUnits: 2,
                coins: ['hello'],
                rule: {
                    name: 'default',
                    options: {
                        rateForPurchase: 0.05,
                        rateForSale: 0.05,
                    },
                },
            }).then(() => {
                done();
            });
        });

        after(() => {
            looper.stop(ACCOUNT_ID, MARKET, BASE);
        });

        it('should return traders info when get called', () => {
            const traders = looper.list(ACCOUNT_ID);
            expect(traders.length).to.equal(1);
            expect(traders[0].market).to.equal(MARKET);
            expect(traders[0].base).to.equal(BASE);
            expect(traders[0].interval).to.equal(INTERVAL);
            expect(traders[0].minUnits).to.equal(1);
            expect(traders[0].maxUnits).to.equal(2);
            expect(traders[0].coins).to.deep.equal(['hello']);
            expect(traders[0].rule).to.deep.equal({
                name: 'default',
                options: {
                    rateForPurchase: 0.05,
                    rateForSale: 0.05,
                },
            });
        });
    });
});
