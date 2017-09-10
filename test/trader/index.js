import sinon from 'sinon';
import { expect, should } from 'chai';
import * as trader from '../../src/trader';
import * as vctsApi from '../../src/api/vcts';

describe('trader/index', function () {
  const ACCOUNT_ID = 'test-user';
  const MARKET = 'poloniex';
  before(() => {
    sinon.stub(vctsApi, 'getTickers')
      .withArgs(MARKET).returns(Promise.resolve())
    sinon.stub(vctsApi, 'getAssets')
      .withArgs(ACCOUNT_ID, MARKET).returns(Promise.resolve({
        BTC: 1.5,
        USDT: 1000
      }));
    sinon.stub(buyer, 'buy').withArgs(sinon.match.any, sinon.match({BTC: 1.5, USDT: 1000})).returns(Promise.resolve());
    sinon.stub(seller, 'sell').returns(Promise.resolve());
  });
  after(() => {
    vctsApi.getTickers.restore();
    vctsApi.getAssets.restore();
    buyer.buy.restore();
    seller.sell.restore();
  })
  describe('trade', () => {
  });
});
