import { describe, it } from 'mocha';
import { expect } from 'chai';
import { redisCluster, sequelize } from './init.spec';
import { initModel, User } from './UserModel';
import { SequelizeCache } from '@ezweb/sequelize-redis-cache';

describe('sequelize-redis-cache', async () => {
    before(async () => {
        initModel(sequelize);

        await sequelize.sync();
        await User.bulkCreate([
            { name: 'toto', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'tutu', email: 'aice@domain.com', country: 'FR' },
            { name: 'toto', email: 'toto@domain.com', country: 'BE' },
            { name: 'tutu', email: 'aice@domain.com', country: 'BE' },
            { name: 'toto', email: 'anotherone@domain.com', country: 'BE' },
            { name: 'arso', email: 'me@domain.com', country: 'CH' },
        ] as User[]);
    });

    it('BatchLoader find', async () => {
        const cache = new SequelizeCache(User, redisCluster);
        const res = await cache.findAll({ where: { country: 'BE' } }, { ttl: 10 });
        expect(res.length).to.eq(3);
        const res3 = await cache.count({ where: { country: 'BE' } }, { ttl: 10 });
        expect(res3).to.eq(3);
        await User.bulkCreate([{ name: 'toto', email: '798@domain.com', country: 'BE', bornDate: new Date('1985-07-21') }]);
        expect(await cache.count({ where: { country: 'BE' } }, { ttl: 10 })).to.eq(3);
        expect(await cache.count({ where: { country: 'BE' } }, { ttl: 10, skip: true })).to.eq(4);
    });
});
