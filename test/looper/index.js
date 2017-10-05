import sinon from 'sinon';
import { expect, should } from 'chai';
import * as looper from '../../src/looper';
import * as trader from '../../src/trader';
import * as vctsApi from '../../src/api/vcts';

describe('looper/index', function () {
  const NON_EXIST_ACCOUNT_ID = 'non-exist-account-id';
  const ACCOUNT_ID = 'test-account';
  const MARKET = 'poloniex';
  const INTERVAL = 60 * 1000;
  let mockTrader;
  before(() => {
    mockTrader = sinon.mock(trader);
    sinon.stub(vctsApi, 'findUser')
      .withArgs(ACCOUNT_ID).returns(Promise.resolve({ id: ACCOUNT_ID }))
      .withArgs(NON_EXIST_ACCOUNT_ID).returns(Promise.resolve(null));
  });
  after(() => {
    mockTrader.restore();
  })
  describe('run', () => {
    afterEach(done => {
      looper.stop(ACCOUNT_ID, MARKET).then(() => {
        done();
      });
    });
    it('should return looper info when run called', done => {
      looper.run(ACCOUNT_ID, MARKET, INTERVAL).then(info => {
        expect(info.market).to.equal(MARKET);
        expect(info.interval).to.equal(INTERVAL);
        done();
      });
    });
    it('should raise exception when duplicated run called', done => {
      looper.run(ACCOUNT_ID, MARKET, INTERVAL).then(() => {
        looper.run(ACCOUNT_ID, MARKET, INTERVAL).catch(err => {
          expect(err).to.equal('duplicated');
          done();
        });
      });
    });
    it('should reject when accountId does not exist', done => {
      looper.run(NON_EXIST_ACCOUNT_ID, MARKET, INTERVAL).catch(err => {
        expect(err).to.equal('id does not exist')
        done();
      });
    });
  });
  describe('stop', () => {
    it('should not raise exception when looper is not running', done => {
      looper.stop(ACCOUNT_ID, MARKET).then(() => {
        done();
      });
    });
  });
  describe('list', () => {
    before(done => {
      looper.run(ACCOUNT_ID, MARKET, INTERVAL).then(() => {
        done();
      });
    });
    after(() => {
      looper.stop(ACCOUNT_ID, MARKET);
    })
    it('should return loopers info when get called', () => {
      let info = looper.list(ACCOUNT_ID);
      expect(info.length).to.equal(1);
      expect(info[0].market).to.equal(MARKET);
      expect(info[0].interval).to.equal(INTERVAL);
    });
  });
});
