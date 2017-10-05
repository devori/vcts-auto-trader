import sinon from 'sinon';
import { expect, should } from 'chai';
import nock from 'nock';
import env from '../../src/env';
import * as vctsApi from '../../src/api/vcts';

describe('api/vcts', function () {
  const NON_EXIST_USERNAME = 'non-exist-username';
  const USERNAME = 'test-user';
  const MARKET = 'poloniex';
  describe('getTickers', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .get(`/api/v1/public/markets/${MARKET}/tickers`)
        .reply(200, {
          'BTC': {
            'BCN': {
                'base': 'BTC',
                'vcType': 'BCN',
                'low': 3.3e-7,
                'high': 3.4e-7,
                'timestamp': 1503814746242
            }
          },
          'USDT': {
            'DASH': {
              'base': 'USDT',
              'vcType': 'DASH',
              'low': 372.0002006,
              'high': 372.99999873,
              'timestamp': 1503814746243
            }
          }
        });
    });
    it('should return tickers when getTickers called', done => {
      vctsApi.getTickers(MARKET).then(tickers => {
        expect(tickers.BTC.BCN.timestamp).to.equal(1503814746242);
        expect(tickers.USDT.DASH.timestamp).to.equal(1503814746243);
        done();
      })
    });
    after(() => {
      nock.cleanAll();
    })
  });
  describe('getAssets', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .get(`/api/v1/private/users/${USERNAME}/markets/${MARKET}/assets`)
        .reply(200, {
          "USDT": {
            "BTC": []
          },
          "BTC": {
            "BCN": [
              {
                "base": "BTC",
                "vcType": "BCN",
                "units": 109.72500000000001,
                "price": 0.00000119,
                "total": 0.0001309,
                "type": "buy",
                "timestamp": 1498053342499,
                "uuid": "8c783ac3-6a02-4830-8bc4-e0360eb7c250"
              }
            ]
          }
        });
    });
    it('should return assets when it called', done => {
      vctsApi.getAssets(USERNAME, MARKET).then(balances => {
        expect(balances.USDT.BTC.length).to.equal(0);
        expect(balances.BTC.BCN[0].timestamp).to.equal(1498053342499);
        done();
      });
    });
    after(() => {
      nock.cleanAll();
    });
  });
  describe('buy', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .post(`/api/v1/private/users/${USERNAME}/markets/${MARKET}/assets/BTC/ETH`, {
          rate: 0.1,
          units: 1
        })
        .reply(201, {
          result: 'buy success'
        });
    });
    it('should call url using post to buy when it called', done => {
      vctsApi.buy(USERNAME, MARKET, 'BTC', 'ETH', 0.1, 1).then(res => {
        expect(res.result).to.equal('buy success');
        done();
      });
    });
    after(() => {
      nock.cleanAll();
    });
  });
  describe('sell', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .delete(`/api/v1/private/users/${USERNAME}/markets/${MARKET}/assets/BTC/ETH`, {
          rate: 0.1,
          units: 1
        })
        .reply(200, {
          result: 'sell success'
        });
    });
    it('should call url using delete to sell when it called', done => {
      vctsApi.sell(USERNAME, MARKET, 'BTC', 'ETH', 0.1, 1).then(res => {
        expect(res.result).to.equal('sell success');
        done();
      });
    });
    after(() => {
      nock.cleanAll();
    });
  });
  describe('findUser', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .get(`/api/v1/private/users/${USERNAME}`)
        .reply(200, {
          id: USERNAME
        });
      nock(env.VCTS_BASE_URL)
        .get(`/api/v1/private/users/${NON_EXIST_USERNAME}`)
        .reply(404);
    });
    after(() => {
      nock.cleanAll();
    });
    it('should return user when user exists', done => {
      vctsApi.findUser(USERNAME).then(res => {
        expect(res.id).to.equal(USERNAME);
        done();
      });
    });
    it('should return null when user does not exist', done => {
      vctsApi.findUser(USERNAME).then(res => {
        expect(res).to.be.null;
        done();
      });
    });
  });
});
