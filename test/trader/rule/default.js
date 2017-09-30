import sinon from 'sinon';
import { expect, should } from 'chai';
import * as rule from '../../../src/trader/rule/default';

describe('trader/rule/default', function () {
  let VC_TYPE = 'ETH';

  before(() => {
  });
  after(() => {
  });
  describe('judgeForPurchase', () => {
    describe('when base is BTC', () => {
      it('when last ticker high price < 93% of min price asset, return 0.1 units and high * 1.02', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ high: 92 }], [{ price: 100 }]);
        expect(result.units).to.equal(0.1);
        expect(result.rate).to.equal(92 * 1.02);
      });
      it('when last ticker high price >= 93% of min price asset, return 0 units', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ high: 93 }], [{ price: 100 }]);
        expect(result.units).to.equal(0);
      })
      it('when assets are empty, should return 0.1 units and high * 1.02', () => {
        let result = rule.judgeForPurchase('BTC', 'ETH', [{ high: 92 }], []);
        expect(result.units).to.equal(0.1);
        expect(result.rate).to.equal(92 * 1.02);
      });
    });
  });
  describe('judgeForSale', () => {
    describe('when base is BTC', () => {
      it('when assets are empty, should return 0 units', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ low: 92 }], []);
        expect(result.units).to.equal(0);
      });
      it('when assets that are less than last ticker price * 0.93 exist, return units of assets and low * 0.98 rate', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ low: 100 }], [
          { price: 92, units: 1 },
          { price: 92, units: 2 },
          { price: 92, units: 3 },
          { price: 93, units: 4 }
        ]);
        expect(result.rate).to.equal(98);
        expect(result.units).to.equal(6);
      });
      it('when total units of assets <= 0.01, should return 0 units', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ low: 100 }], [
          { price: 92, units: 0.1 }
        ]);
        expect(result.units).to.equal(0);
      });
      it('when return units is same to total unit, return units except 0.01 units', () => {
        let result = rule.judgeForSale('BTC', 'ETH', [{ low: 100 }], [
          { price: 92, units: 1 },
          { price: 92, units: 2 },
          { price: 92, units: 3 }
        ]);
        expect(result.units).to.equal(5.99);
      });
    });
  });
});
