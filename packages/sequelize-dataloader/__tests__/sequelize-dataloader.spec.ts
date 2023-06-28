import { queryCount, redisCluster, sequelize } from './init.spec';
import { model, User, UserNotFoundError } from './UserModel';
import { Op, QueryTypes } from '@sequelize/core';
import { RedisDataLoader } from '@daryl-software/redis-dataloader';
import { BatchLoader, BatchLoaderMultiColumns, MultipleDataloader } from '@daryl-software/sequelize-dataloader';
import { ModelNotFoundError, NotFoundError } from '@daryl-software/error';

describe('sequelize-dataloader', () => {
    beforeAll(async () => {
        model(sequelize);
        await sequelize.sync();
        await User.bulkCreate([
            { name: 'toto', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'tutu', email: 'aice@domain.com', country: 'FR' },
            { name: 'toto', email: 'toto@domain.com', country: 'BE' },
            { name: 'tutu', email: 'aice@domain.com', country: 'BE' },
            { name: 'toto', email: 'anotherone@domain.com', country: 'BE' },
            { name: 'arso', email: 'me@domain.com', country: 'CH' },
        ]);
    });
    describe('helpers', () => {
        it('BatchLoader find', async () => {
            const finder = await BatchLoader(User, 'name', ['toto', 'arsonik'], 'find');
            expect(finder[0].email).to.eq('toto@domain.com');
            expect(finder[1]).to.be.an.undefined;
        });
        it('BatchLoader filter', async () => {
            const finder = await BatchLoader(User, 'country', ['FR', 'VA'], 'filter');
            expect(finder[0]).to.length(2);
            expect(finder[1]).to.be.undefined;
        });
        it('BatchLoaderMultiColumns w predefined where', async () => {
            const finder = await BatchLoaderMultiColumns(User, ['name', 'email'], [{ name: 'toto', email: 'toto@domain.com' }], 'filter', { find: { where: { country: 'FR' } } });
            expect(finder[0]).to.not.instanceOf(Error);
        });
        it('BatchLoaderMultiColumns', async () => {
            const finder = await BatchLoaderMultiColumns(
                User,
                ['country', 'name'],
                [
                    { country: 'FR', name: 'toto' },
                    { country: 'FR', name: 'xxto' },
                ],
                'find'
            );

            expect(finder[0].email).to.eq('toto@domain.com');
            expect(finder[1]).to.be.undefined;
        });
    });

    describe('Custom error', () => {
        it('should be a user not found error type', async () => {
            const results = await User.loaderById.loadMany([1, 9999]);
            expect(results[0]).to.instanceof(User);
            expect(results[1]).to.instanceof(UserNotFoundError);
            expect((results[1] as UserNotFoundError).id).to.eq(9999);
        });
    });

    describe('loaders', () => {
        it('single id', async () => {
            const a = await User.loaderById.load(2);
            expect(a.bornDate).to.be.eq(null);

            await User.update({ bornDate: '1985-07-21' }, { where: { id: 1 } });
            const b = await User.loaderById.load(2);
            expect(b.bornDate).to.be.eq(null);

            User.loaderById.clear(1);
            const c = await User.loaderById.load(1);
            expect(c.bornDate).to.be.eq('1985-07-21');
        });
        it('single id not found', async () => {
            const a = await User.loaderById.load(new Date().getTime()).catch((e) => e);
            expect(a).to.instanceof(UserNotFoundError);
            const a2 = await User.loaderById.load(new Date().getTime()).catch((e) => e);
            expect(a2).to.instanceof(UserNotFoundError);
        });
        it('single with hard coded where', async () => {
            const a = await User.loaderFrenchNames.load('toto');
            expect(a.name).to.eq('toto');
        });
        it('multi', async () => {
            const a = await User.loaderByName.load('toto');
            expect(a).to.length(3);
        });
        it('multi cols single result', async () => {
            const a = await User.loaderByNameAndEmail.loadMany([
                { name: 'toto', email: 'toto@domain.com' },
                { name: 'tuxu', email: 'aice@domain.com' },
                { name: 'tutu', email: 'aice@domain.com' },
            ]);
            expect(a[0]).to.instanceof(User);
            expect(a[2]).to.instanceof(User);
            expect(a[1]).to.instanceof(ModelNotFoundError);
        });
        it('multi cols multi result', async () => {
            const a = await User.loaderByNameAndCountry.load({ name: 'toto', country: 'BE' });
            expect(a).to.length(2);
        });
        it('multi not found', async () => {
            await expect(User.loaderByNameAndCountry.load({ name: '404xxx', country: 'BE' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('Redis.io', () => {
        it('set + get', async () => {
            await redisCluster.set('toto', 'test', 'EX', 5);
            expect(await redisCluster.get('toto')).to.eq('test');
        });
        it('single', async () => {
            await User.redisLoaderById.clearAsync(1);
            const u = await User.redisLoaderById.load(1);
            expect(u.name).to.eq('toto');
            expect(u.createdAt).to.instanceof(Date);
            const u2 = await User.redisLoaderById.load(1);
            expect(u2.name).to.eq('toto');
            expect(u2.createdAt).to.instanceof(Date);
        });
        it('multi', async () => {
            const u = await User.redisLoaderByName.load('toto');
            expect(u.length).to.gt(2);
            const u2 = await User.redisLoaderByName.load('toto');
            expect(u2.length).to.gt(2);
        });
        it('clear', async () => {
            const u = await User.redisLoaderByName.clearAsync('toto');
            expect(u).to.gte(1);
        });
        it('prime', async () => {
            await User.redisLoaderById.primeAsync(999, User.build({ id: 999, name: 'primed' }));
            const u2 = await User.redisLoaderById.load(999);
            expect(u2.name).to.eq('primed');
        });
        it('multi cols single result', async () => {
            const a = await User.redisLoaderByNameAndEmail.loadMany([
                { name: 'toto', email: 'toto@domain.com' },
                { name: 'tuxu', email: 'aice@domain.com' },
                { name: 'tutu', email: 'aice@domain.com' },
            ]);
            expect(a[0]).to.instanceof(User);
            expect(a[2]).to.instanceof(User);
            expect(a[1]).to.instanceof(ModelNotFoundError);
        });
        it('call with object containing unknown key', async () => {
            const data = { name: 'arso', email: 'me@domain.com', notDbKey: true };
            const arso = await User.redisLoaderByNameAndEmail.load(data);
            expect(arso.name).to.eq('arso');
        });
        it('store not found in cache', async () => {
            const uid = new Date().getTime();
            const x = queryCount;
            const u = await User.redisLoaderById.load(uid).catch((e) => e);
            expect(u).to.instanceof(UserNotFoundError);
            expect((u as UserNotFoundError).id).to.eq(uid);
            expect(queryCount).to.eq(x + 1);

            const u2 = await User.redisLoaderById.load(uid).catch((e) => e);
            expect(u2).to.instanceof(UserNotFoundError);
            expect((u2 as UserNotFoundError).id).to.eq(uid);
            expect(queryCount).to.eq(x + 1, 'should not make another query');
        });
        it('Custom redis dataloader', async () => {
            type CountryCode = string;
            const loader = new RedisDataLoader<CountryCode, number>(
                `CountUserByCountry@${new Date().getTime()}`,
                async (isos) => {
                    const sql = `SELECT COUNT(*) AS n, country FROM ${User.table.tableName} WHERE country IN("${isos.join('", "')}") GROUP BY country`;
                    const results = await User.sequelize.query<{ n: number; country: string }>(sql, { type: QueryTypes.SELECT });
                    return isos.map((iso) => results.find((result) => result.country === iso)?.n ?? new NotFoundError(iso, 'CountUserByCountry'));
                },
                {
                    maxBatchSize: 20,
                    redis: {
                        client: redisCluster,
                        //logging: console.log,
                        ttl: 5,
                        deserialize: (_, sum) => Number(sum),
                        serialize: (data) => String(data),
                    },
                }
            );
            const res = await loader.loadMany(['FR', 'CH']);
            expect(res[0]).to.eq(2);
            expect(res[1]).to.eq(1);
        });
        test('Custom multiple with find clause', async () => {
            const loader = MultipleDataloader(User, ['name', 'email'], {
                find: {
                    where: {
                        country: {
                            [Op.ne]: 'FR',
                        },
                        name: {
                            [Op.ne]: null,
                        },
                    },
                },
                maxBatchSize: 20,
                redis: {
                    client: redisCluster,
                    //logging: console.log,
                    ttl: 5,
                },
            });
            await expect(loader.load({ name: 'toto', email: 'toto@domain.com' })).resolves.length(1);
            await expect(loader.load({ name: 'toto', email: 'xxxx@domain.com' })).rejects.toThrow(ModelNotFoundError);
        });
    });
});
