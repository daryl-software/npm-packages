import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Db } from '@ezweb/db';
import { Sequelize } from 'sequelize';
import { initModel, User } from './UserModel';
import { hydrateModel } from '../src';

describe('db', () => {
    let dbA: Sequelize;
    let dbB: Sequelize;
    before(() => {
        // eslint-disable-next-line no-console
        const logging = console.log;
        dbA = new Sequelize({ dialect: 'sqlite', storage: 'test-db.sqlite', logging });
        dbB = new Sequelize({
            dialect: 'sqlite',
            storage: 'temp.sqlite',
            logging,
        });
    });

    after(() => {
        dbA.close();
        dbB.close();
    });

    it('Configuration MySQL with slave', () => {
        try {
            new Db({
                database: 'xxx',
                master: {
                    host: 'dd',
                    port: 3306,
                    charset: 'utf8',
                },
                type: 'mysql',
                slaves: [
                    {
                        host: 'dd',
                        port: 3306,
                        charset: 'utf8',
                        username: 'toto',
                        password: 'passowd',
                        weight: 1,
                    },
                    {
                        host: 'dd',
                        port: 3306,
                        charset: 'utf8',
                        weight: 0,
                    },
                ],
            });
            throw new Error('cannot be here');
        } catch (e) {
            expect(e.message).to.be.match(/Please install mariadb package manually/);
        }
    });
    it('Configuration postgres', () => {
        try {
            new Db(
                {
                    database: 'ddd',
                    master: {
                        host: 'dd',
                        port: 3306,
                        charset: 'utf8',
                    },
                    type: 'postgres',
                },
                {
                    confAppend: {
                        logging: () => {
                            //
                        },
                    },
                }
            );
            throw new Error('cannot be here');
        } catch (e) {
            expect(e.message).to.be.match(/Please install pg package manually/);
        }
    });
    it('Configuration postgres', () => {
        try {
            new Db({
                database: '',
                master: {
                    host: 'dd',
                    port: 3306,
                    charset: 'utf8',
                },
                type: 'pgsql',
            });
            throw new Error('cannot be here');
        } catch (e) {
            expect(e.message).to.be.match(/Please install pg package manually/);
        }
    });

    it('Configuration change over time', async () => {
        initModel(dbA);
        dbA.sync();
        await User.bulkCreate([
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
        ]);
        const userDbA = await User.findByPk(1);
        expect(userDbA?.name).to.eq('arsonik');

        initModel(dbB);
        dbB.sync();

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
