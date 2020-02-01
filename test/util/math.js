import math from '../../src/util/math';
import {expect, should} from 'chai';

describe('util/math', () => {
    describe('truncRemainder', () => {
        it('should return 1.23 when (1.2345, 0.01) calls', () => {
            expect(math.truncRemainder(1.2345, 0.01)).to.equal(1.23);
        });

        it('should return 1 when (1.2345, 1) calls', () => {
            expect(math.truncRemainder(1.2345, 1)).to.equal(1);
        });

        it('should return 1500 when floor(1600, 500) calls', () => {
            expect(math.truncRemainder(1600, 500)).to.equal(1500);
        })
    });
});