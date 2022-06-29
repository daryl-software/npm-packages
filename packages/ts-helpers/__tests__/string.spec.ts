import { expect } from 'chai';
import '@ezweb/ts-helpers';

describe('String prototype', async () => {
    it('First char to uppercase ', async () => {
        expect('abc'.ucfirst()).to.eq('Abc');
        expect('/dce'.ucfirst()).to.eq('/dce');
    });

    it('Base64 decode', async () => {
        const value = '64 bαses de côde 🤔';
        const encoded64 = Buffer.from(value).toString('base64');
        expect(encoded64.base64Decode()).to.eq(value);
    });

    it('Explode', async () => {
        const value = 'expl';
        expect(value.explode('', 0)).to.eql(['expl']);
        expect(value.explode('', 2)).to.eql(['e', 'xpl']);
        expect(value.explode('')).to.eql(['e', 'x', 'p', 'l']);
    });

    it('Mysql Crc32', async () => {
        expect('123'.mysqlCrc32()).to.eq(2286445522);
        expect('Bob'.mysqlCrc32()).to.eq(3448174496);
    });

    it('Uncapitalize', async () => {
        expect('123A'.uncapitalize()).to.eq('123A');
        expect('BoB'.uncapitalize()).to.eq('boB');
    });
});
