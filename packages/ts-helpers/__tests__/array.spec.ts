import { expect, spy, use } from 'chai';
import '@ezweb/ts-helpers';
use(require('chai-spies'));

describe('Array prototype', async () => {
    const anyArray: Array<any> = [0, undefined, null, NaN, 'string', {}, false, 8, -6];
    const numberArray: Array<number> = [0, 1, -8];

    it('First', async () => {
        expect(anyArray.first()).to.eq(0);
    });

    it('Last', async () => {
        expect(anyArray.last()).to.eq(-6);
    });

    it('Filter null and undefined', async () => {
        expect(anyArray.filterNullAndUndefined()).to.eql([0, NaN, 'string', {}, false, 8, -6]);
    });

    it('Filter Error', async () => {
        const anyArray2 = [0, undefined, null, NaN, 'string', false, 8, -6];
        expect(anyArray2.filterError()).to.eql([0, undefined, null, NaN, 'string', false, 8, -6]);
    });

    it('Shuffle', async () => {
        spy.on(Math, 'random', () => 0.4);
        const sArray = [...anyArray].shuffle();
        expect(sArray).to.eql(['string', 0, 8, undefined, {}, false, null, -6, NaN]);
        spy.restore(Math);
    });

    it('Avg', async () => {
        const sArray = [...numberArray, -9];
        expect([].avg()).to.eq(0);
        expect(sArray.avg()).to.eq(-4);
    });

    it('Unique', async () => {
        const uArray = [...anyArray, 666, ...anyArray];
        expect(uArray.unique()).to.eql([0, undefined, null, NaN, 'string', {}, false, 8, -6, 666]);
    });

    it('mutableCopy', async () => {
        const toCopy = [...anyArray];
        let copy = toCopy;
        copy.push(888);

        copy = toCopy.mutableCopy();
        copy.push(666);

        expect(anyArray).to.eql([0, undefined, null, NaN, 'string', {}, false, 8, -6]);
        expect(toCopy.mutableCopy()).to.eql([0, undefined, null, NaN, 'string', {}, false, 8, -6, 888]);
        expect(copy.mutableCopy()).to.eql([0, undefined, null, NaN, 'string', {}, false, 8, -6, 888, 666]);
    });

    it('Sample', async () => {
        spy.on(Math, 'random', () => 0.5);
        expect(anyArray.sample()).to.eq('string');
        spy.restore(Math);
    });

    it('Range', async () => {
        expect(Array.range(3, 5)).to.eql([3, 4]);
        expect(Array.range(0, 0)).to.eql([]);
        expect(Array.range(1, 0)).to.eql([]);
        expect(Array.range(-2, 0)).to.eql([-2, -1]);
        expect(Array.range(-1, 2)).to.eql([-1, 0, 1]);
        expect(Array.range(-5, NaN)).to.eql([]);
        expect(Array.range(NaN, 10)).to.eql([]);
    });
});
