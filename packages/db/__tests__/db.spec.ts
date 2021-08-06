import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Db } from '@ezweb/db';
import { Sequelize } from 'sequelize';
import { initModel, User } from './UserModel';

describe('Db', async () => {
    it('Configuration MySQL with slave', async () => {
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
    it('Configuration postgres', async () => {
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
    it('Configuration postgres', async () => {
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
        const logging = console.log;
        const dbA = new Sequelize({ dialect: 'sqlite', storage: 'memory', logging });
        const dbB = new Sequelize({
            dialect: 'sqlite',
            storage: 'temp.sqlite',
            logging,
        });

        initModel(dbA);
        await dbA.sync({ force: true });
        await User.bulkCreate([
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
        ]);
        const userDbA = await User.findByPk(1);
        expect(userDbA?.name).to.eq('arsonik');

        initModel(dbB);
        await dbB.sync({ force: true });

        await User.bulkCreate([
            { name: 'gregorette', email: 'aice@domain.com', country: 'CH' },
            { name: 'arsonik', email: 'toto@domain.com', country: 'FR', bornDate: new Date('1985-07-21') },
        ]);
        const userDbB = await User.findByPk(1);
        expect(userDbB?.name).to.eq('gregorette');
    });
});
