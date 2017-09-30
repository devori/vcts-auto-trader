import sinon from 'sinon';
import { expect, should } from 'chai';
import * as trader from '../../src/trader';
import * as vctsApi from '../../src/api/vcts';
import * as rule from '../../src/trader/rule'

describe('trader/index', function () {
  const ACCOUNT_ID = 'test-user';
  const MARKET = 'poloniex';
  before(() => {
    sinon.stub(vctsApi, 'getTickers')
      .withArgs(MARKET).returns(Promise.resolve({
        BTC: {
          ETH: {
            ask: 1,
            bid: 0.99
          }
        }
      }))
    sinon.stub(vctsApi, 'getAssets')
      .withArgs(ACCOUNT_ID, MARKET).returns(Promise.resolve({
        BTC: {
          BTC: [{ units: 10 }],
          ETH: [{ units: 2, rate: 0.1, totla: 0.2 }]
        }
      }));
    sinon.stub(vctsApi, 'buy').returns(Promise.resolve());
    sinon.stub(vctsApi, 'sell').returns(Promise.resolve());
    sinon.stub(rule, 'judgeForPurchase').returns({ units: 0, rate: 0 });
    sinon.stub(rule, 'judgeForSale').returns({ units: 0, rate: 1000000000 });
  });
  after(() => {
    vctsApi.getTickers.restore();
    vctsApi.getAssets.restore();
    vctsApi.buy.restore();
    vctsApi.sell.restore();
    rule.judgeForPurchase.restore();
    rule.judgeForSale.restore();
  })
  describe('trade', () => {
  });
});
