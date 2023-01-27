import { Sequelize } from '@sequelize/core';
import { initModel, User } from './UserModel';
import { hydrateModel } from '@daryl-software/db';

describe('db', () => {
    let dbA: Sequelize;
    let dbB: Sequelize;
    beforeAll(() => {
        // eslint-disable-next-line no-console
        const logging = console.log;
        dbA = new Sequelize({ dialect: 'sqlite', storage: 'test-db.sqlite', logging });
        dbB = new Sequelize({
            dialect: 'sqlite',
            storage: 'temp.sqlite',
            logging,
        });
    });

    afterAll(() => {
        dbA.close();
        dbB.close();
    });

    it('Configuration postgres', () => {
        try {
            new Sequelize({
                database: 'ddd',
                host: 'dd',
                port: 3306,
                dialect: 'postgres',
            });
            throw new Error('cannot be here');
        } catch (e: any) {
            expect(e.message).to.match(/Please install pg package manually/);
        }
    });

    it('Configuration change over time', async () => {
        initModel(dbA);
        await dbA.sync();
        await User.bulkCreate([
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
        ]);
        const userDbA = await User.findByPk(1);
        expect(userDbA?.name).to.eq('arsonik');

        initModel(dbB);
        await dbB.sync();

        await User.bulkCreate([
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
        ]);
        const userDbB = await User.findByPk(1);
        expect(userDbB?.name).to.eq('gregorette');
    });

    it('Helpers hydrate', async () => {
        await User.bulkCreate([
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
        ]);
        const user = await User.findByPk(1);
        const str = JSON.stringify(user);
        const hyd = hydrateModel(User, JSON.parse(str));
        expect(hyd.createdAt.toUTCString()).to.eq(user!.createdAt.toUTCString());
    });
});
