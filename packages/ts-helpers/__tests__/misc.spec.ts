import { expect } from 'chai';
import '@ezweb/ts-helpers';

describe('Misc prototype', async () => {
    it('Sleep', async () => {
        const timeToWait = 100;
        const precision = 5;

        const startTime = performance.now();
        await sleep(timeToWait);
        expect(performance.now() - startTime)
            .to.lte(timeToWait + precision)
            .to.gte(timeToWait);
    });

    it('Filter null and undefined', async () => {
        const anyObject: Record<string, any> = Object.assign({}, [0, undefined, null, NaN, 'string', {}, false, 8, -6]);
        expect(Object.values(filterNullAndUndefined(anyObject))).to.eql([0, NaN, 'string', {}, false, 8, -6]);
    });

    it('Extract number', async () => {
        //Cannot extract
        ['', null, undefined].forEach((value) => {
            expect(() => {
                extractNumber(value);
            }).to.throw(Error, `Cannot extract number from ${value}`);
        });

        //Not finite number
        const value = '<;:?Ab/88\\%^`cD>';
        expect(() => extractNumber(value)).to.throw(Error, `Not isFinite(NaN) from ${value}`);

        //Good extract
        expect(extractNumber('1')).to.eq(1);
        expect(extractNumber('9.5447445885')).to.eq(9.5447445885);
        expect(extractNumber('9544744588554474452869')).to.eq(9.544744588554474e21);
        expect(extractNumber('10e+5')).to.eq(10e5);
    });

    it('Object Keys', async () => {
        interface Human {
            name: string;
            old: number;
        }

        const hKeys = ObjectKeys<Human>({
            name: 'Biz',
            old: 66,
        });

        const fnTestType = (hAttr: Array<keyof Human>) => hAttr;
        expect(fnTestType(hKeys)).to.eql(['name', 'old']);
    });
});
