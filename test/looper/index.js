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

    let mockTrader;
    before(() => {
        mockTrader = sinon.mock(trader);
        sinon.stub(vctsApi, 'findUser')
            .withArgs(ACCOUNT_ID).returns(Promise.resolve({id: ACCOUNT_ID}))
            .withArgs(NON_EXIST_ACCOUNT_ID).returns(Promise.resolve(null));
    });

    after(() => {
        mockTrader.restore();
    });

    describe('run', () => {
        afterEach(() => {
            looper.stop(ACCOUNT_ID, MARKET, BASE);
        });

        it('should return true info when it calls', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                coins: [
                    'hello'
                ]
            }).then(result => {
                expect(result).to.be.true;
                done();
            });
        });

        it('should raise exception when duplicated run called', done => {
            looper.run(ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                coins: []
            }).then(() => {
                looper.run(ACCOUNT_ID, MARKET, BASE, {
                    interval: INTERVAL,
                    coins: [],
                }).catch(err => {
                    expect(err).to.contain('duplicated');
                    done();
                });
            });
        });

        it('should reject when accountId does not exist', done => {
            looper.run(NON_EXIST_ACCOUNT_ID, MARKET, BASE, {
                interval: INTERVAL,
                coins: [],
            }).catch(err => {
                expect(err).to.equal('id does not exist');
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
                coins: ['hello'],
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
            expect(traders[0].coins).to.deep.equal(['hello']);
        });
    });
});
