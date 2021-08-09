import { describe, it } from 'mocha';
import { expect } from 'chai';
import { redisCluster, sequelize } from './init.spec';
import { initModel, User } from './UserModel';
import { DbFactoryCache, SequelizeCache } from '@ezweb/sequelize-redis-cache';
import { QueryTypes } from 'sequelize';

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

    it('SequelizeCache', async () => {
        const cache = new SequelizeCache(User, redisCluster);
        const res = await cache.findAll({ where: { country: 'BE' } }, { ttl: 10 });
        expect(res.length).to.eq(3);
        const res3 = await cache.count({ where: { country: 'BE' } }, { ttl: 10 });
        expect(res3).to.eq(3);
        await User.bulkCreate([{ name: 'toto', email: '798@domain.com', country: 'BE', bornDate: new Date('1985-07-21') }]);
        expect(await cache.count({ where: { country: 'BE' } }, { ttl: 10 })).to.eq(3);
        expect(await cache.count({ where: { country: 'BE' } }, { ttl: 10, skip: true })).to.eq(4);
    });

    it('DbFactoryCache', async () => {
        const cache = new DbFactoryCache(sequelize, redisCluster);
        const time = 'SELECT strftime("%s","now") AS time';
        const x = await cache.query<{ day: string }>(time, { type: QueryTypes.SELECT, plain: true }, { ttl: 10 });
        await cache.query<{ day: string }>('SELECT DATE() AS day', { type: QueryTypes.SELECT, plain: true }, { ttl: 10, clear: true });
        const res = await cache.query<{ day: string }>('SELECT DATE() AS day', { type: QueryTypes.SELECT, plain: true }, { ttl: 10 });
        await cache.query<{ day: string }>('SELECT DATE() AS day', { type: QueryTypes.SELECT, plain: true }, { ttl: 10, skip: true });
        const xn = await cache.query<{ day: string }>(time, { type: QueryTypes.SELECT, plain: true }, { ttl: 10, skip: true });
        expect(res.day).to.length(10);
        expect(res.day).to.length(10);
        expect(x).not.to.eq(xn);
    });
    it('DbFactoryCache', async () => {
        const cache = new DbFactoryCache(sequelize, redisCluster);
        await cache.queryModel(`SELECT * FROM ${User.tableName}`, { model: User, type: QueryTypes.SELECT }, { ttl: 10, clear: true });
        const res = await cache.queryModel(`SELECT * FROM ${User.tableName}`, { model: User }, { ttl: 10 });
        expect(res.length).to.gte(6);
        const res1 = await cache.queryModel(`SELECT * FROM ${User.tableName}`, { model: User, plain: true }, { ttl: 10 });
        expect(res1.id).to.gte(1);
    });
});
