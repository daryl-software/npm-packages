import '@ezweb/ts-helpers';
import { expect } from 'chai';

describe('Date prototype', async () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const dayOne = new Date(dayMs);
    it('Convert to mysql UTC string', async () => {
        const dateWithTime = new Date('27 Jun 2022 10:11:12 UTC');
        expect(dateWithTime.toMysqlUTCString()).to.eq('2022-06-27 10:11:12');
    });

    it('Days', async () => {
        expect(dayOne.days()).to.eq(1);
    });

    it('Hours', async () => {
        expect(dayOne.hours()).to.eq(24);
    });

    it('Mins', async () => {
        expect(dayOne.mins()).to.eq(24 * 60);
    });

    it('Secs', async () => {
        expect(dayOne.secs()).to.eq(24 * 60 * 60);
    });

    it('Minus', async () => {
        const dayTwo = new Date(dayMs * 2);
        const clone = (date: Date | number) => new Date(typeof date === 'number' ? date : date.getTime());

        //With date
        expect(clone(dayTwo).minus(clone(0)).getTime()).to.eq(dayTwo.getTime());
        expect(clone(dayTwo).minus(clone(dayTwo)).getTime()).to.eq(0);
        expect(clone(dayTwo).minus(clone(dayOne)).getTime()).to.eq(dayMs);
        expect(clone(dayOne).minus(clone(dayTwo)).getTime()).to.eq(-dayMs);

        //With date abs
        expect(clone(dayTwo).minus(clone(0), true).getTime()).to.eq(dayTwo.getTime());
        expect(clone(dayTwo).minus(clone(dayTwo), true).getTime()).to.eq(0);
        expect(clone(dayTwo).minus(clone(dayOne), true).getTime()).to.eq(dayMs);
        expect(clone(dayOne).minus(clone(dayTwo), true).getTime()).to.eq(dayMs);

        //With number
        expect(clone(dayTwo).minus(0).getTime()).to.eq(dayTwo.getTime());
        expect(clone(dayTwo).minus(dayTwo.getTime()).getTime()).to.eq(0);
        expect(clone(dayTwo).minus(dayOne.getTime()).getTime()).to.eq(dayMs);
        expect(clone(dayOne).minus(dayTwo.getTime()).getTime()).to.eq(-dayMs);

        //With number abs
        expect(clone(dayTwo).minus(0, true).getTime()).to.eq(dayTwo.getTime());
        expect(clone(dayTwo).minus(dayTwo.getTime(), true).getTime()).to.eq(0);
        expect(clone(dayTwo).minus(dayOne.getTime(), true).getTime()).to.eq(dayMs);
        expect(clone(dayOne).minus(dayTwo.getTime(), true).getTime()).to.eq(dayMs);
    });
});
