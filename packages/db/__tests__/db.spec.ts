import { Sequelize } from '@sequelize/core';
import { initModel, User } from './UserModel';
import { hydrateModel } from '@daryl-software/db';

describe('db', () => {
    let dbA: Sequelize;
    let dbB: Sequelize;
    beforeAll(async () => {
        // eslint-disable-next-line no-console
        const logging = console.log;
        dbA = new Sequelize(':memory:',{
            dialect: 'sqlite', logging });
        dbB = new Sequelize(':memory:',{
            dialect: 'sqlite',
            logging,
        });
        initModel(dbA);
        await dbA.sync();
    });

    afterAll(() => {
        dbA.close();
        dbB.close();
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
