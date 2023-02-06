
import { allowErrors, emptyArrayIfNotFound, HttpError, NotFoundError, nullIfNotFound, undefinedIfNotFound } from '@daryl-software/error';

describe('Errors', async () => {
    it('allow error - pass', async () => {
        const test = await Promise.reject(new NotFoundError('test', 'a message')).catch(allowErrors('catched', NotFoundError));
        expect(test).to.eq('catched');
    });
    it('allow error - fail', async () => {
        const test = await Promise.reject(new Error('test 🦄'))
            .catch(allowErrors('catched', NotFoundError))
            .catch(() => 'failed');
        expect(test).to.eq('failed');
    });
    it('null if not found', async () => {
        const test = await Promise.reject(new NotFoundError('test', 'a message')).catch(nullIfNotFound);
        expect(test).to.be.null;
    });
    it('undefined if not found', async () => {
        const test = await Promise.reject(new NotFoundError('test', 'a message')).catch(undefinedIfNotFound);
        expect(test).to.be.undefined;
    });
    it('empty [] if not found', async () => {
        const test = await Promise.reject(new NotFoundError('test', 'a message')).catch(emptyArrayIfNotFound);
        expect(test).to.be.eql([]);
    });
    it('http error',  () => {
        const e = new HttpError(404, 'messa');
        expect(e.code).to.eq(404);
    });
    it('not found error to json',  () => {
        const e = new NotFoundError('test', 'a message');
        expect(e.toJSON().code).to.eq('404');
    });
});
