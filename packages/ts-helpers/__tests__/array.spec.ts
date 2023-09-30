
import '@daryl-software/ts-helpers';

describe('Array prototype', async () => {
    const anyArray = [0, undefined, null, NaN, 'string', {}, false, 8, -6];
    const numberArray = [0, 1, -8];

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
        const sArray = [...anyArray].shuffle();
        expect(anyArray.filter((i) => sArray.includes(i)).length).to.eq(anyArray.length);
        expect(sArray).to.not.eql(anyArray);
    });

    it('Avg', async () => {
        const sArray = [...numberArray, -9];
        expect([].avg()).to.eq(0);
        expect(sArray.avg()).to.eq(-4);
    });

    it('Unique', async () => {
        const uArray = ['a', ...numberArray, 666, ...numberArray, 'a'];
        expect(uArray.unique()).to.eql(['a', 0, 1, -8, 666]);
    });

    it('Sample', async () => {
        expect(anyArray.includes(anyArray.sample())).true;
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
    describe('findAsyncSequential', () => {
        it('should return undefined if array is empty', async () => {
            const arr: number[] = [];
            const result = await arr.findAsyncSequential(async (n) => n > 5);
            expect(result).toBeUndefined();
        });

        it('should return undefined if no element satisfies the predicate', async () => {
            const arr = [1, 2, 3, 4, 5];
            const result = await arr.findAsyncSequential(async (n) => n > 5);
            expect(result).toBeUndefined();
        });

        it('should return the first element that satisfies the predicate', async () => {
            const arr = [1, 2, 3, 4, 5];
            const result = await arr.findAsyncSequential(async (n) => n > 2);
            expect(result).toBe(3);
        });

        it('should work with non-numeric arrays', async () => {
            const arr = ['apple', 'banana', 'cherry'];
            const result = await arr.findAsyncSequential(async (s) => s.startsWith('b'));
            expect(result).toBe('banana');
        });

        it('should work with an array of objects', async () => {
            const arr = [
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 30 },
                { name: 'Charlie', age: 35 },
            ];
            const result = await arr.findAsyncSequential(async (person) => person.age > 30);
            expect(result).toStrictEqual({ name: 'Charlie', age: 35 });
        });
    });
});
