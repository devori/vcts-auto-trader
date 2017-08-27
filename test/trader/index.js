import sinon from 'sinon';
import { expect, should } from 'chai';
import * as vctsApi from '../../src/api/vcts';
import * as trader from '../../src/trader';

describe('trader/index', function () {
  const ACCOUNT_ID = 'test-account';
  const MARKET = 'poloniex';
  const INTERVAL = 60 * 1000;
  describe('run', () => {
    afterEach(done => {
      trader.stop(ACCOUNT_ID, MARKET).then(() => {
        done();
      });
    });
    it('should return trader info when run called', done => {
      trader.run(ACCOUNT_ID, MARKET, INTERVAL).then(info => {
        expect(info.market).to.equal(MARKET);
        expect(info.interval).to.equal(INTERVAL);
        done();
      });
    });
    it('should raise exception when duplicated run called', done => {
      trader.run(ACCOUNT_ID, MARKET, INTERVAL);
      trader.run(ACCOUNT_ID, MARKET, INTERVAL).then(()=> {}, err => {
        expect(err).to.equal('duplicated');
        done();
      });
    })
  });
  describe('stop', () => {
    it('should not raise exception when trader is not running', done => {
      trader.stop(ACCOUNT_ID, MARKET).then(() => {
        done();
      });
    });
  });
  describe('list', () => {
    before(done => {
      trader.run(ACCOUNT_ID, MARKET, INTERVAL).then(() => {
        done();
      });
    });
    after(() => {
      trader.stop(ACCOUNT_ID, MARKET);
    })
    it('should return traders info when get called', () => {
      let info = trader.list(ACCOUNT_ID);
      expect(info.length).to.equal(1);
      expect(info[0].market).to.equal(MARKET);
      expect(info[0].interval).to.equal(INTERVAL);
    });
  });
});
