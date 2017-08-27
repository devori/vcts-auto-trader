import sinon from 'sinon';
import { expect, should } from 'chai';
import nock from 'nock';
import env from '../../src/env';
import * as vctsApi from '../../src/api/vcts';

describe('api/vcts', function () {
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
  describe('getBalances', () => {
    before(() => {
      nock(env.VCTS_BASE_URL)
        .get(`/api/v1/private/markets/${MARKET}/assets`)
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
    it('should return balances when getBalances called', done => {
      vctsApi.getBalances(MARKET).then(balances => {
        expect(balances.USDT.BTC.length).to.equal(0);
        expect(balances.BTC.BCN[0].timestamp).to.equal(1498053342499);
        done();
      });
    });
    after(() => {
      nock.cleanAll();
    });
  });
});
