import sinon from 'sinon';
import { expect, should } from 'chai';
import * as rule from '../../../src/trader/rule';

describe('trader/rule/index', function () {
  let VC_TYPE = 'ETH';

  before(() => {
  });
  after(() => {
  });
  describe('judgeForPurchase', () => {
    describe('when base is BTC', () => {
      it('when last ticker ask rate < 93% of min rate asset, return BTC 0.04units and ask * 1.02', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ ask: 92 }], [{ rate: 100 }]);
        expect(result.units).to.equal(Math.trunc(100000000 * 0.04 / (92 * 1.02)) / 100000000);
        expect(result.rate).to.equal(92 * 1.02);
      });
      it('when last ticker ask rate >= 93% of min rate asset, return 0 units', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ ask: 93 }], [{ rate: 100 }]);
        expect(result.units).to.equal(0);
      })
      it('when assets are empty, should return BTC 0.04units units and ask * 1.02', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ ask: 92 }], []);
        expect(result.units).to.equal(Math.trunc(100000000 * 0.04 / (92 * 1.02)) / 100000000);
        expect(result.rate).to.equal(92 * 1.02);
      });
    });
  });
  describe('judgeForSale', () => {
    describe('when base is BTC', () => {
      it('when assets are empty, should return 0 units', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ bid: 92 }], []);
        expect(result.units).to.equal(0);
      });
      it('when assets that are less than last ticker rate * 0.93 exist, return units of assets and bid * 0.98 rate', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ bid: 100 }], [
          { rate: 92, units: 1 },
          { rate: 92, units: 2 },
          { rate: 92, units: 3 },
          { rate: 93, units: 4 }
        ]);
        expect(result.rate).to.equal(98);
        expect(result.units).to.equal(6);
      });
      it('when return units is same to total unit, return units except 0.01 units', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ bid: 100 }], [
          { rate: 92, units: 1 },
          { rate: 92, units: 2 },
          { rate: 92, units: 3 }
        ]);
        expect(result.units).to.equal(5.99);
      });
    });
  });
});
