import { ConnectionOptions, Dialect, Sequelize, Options as SequelizeOptions } from 'sequelize';
import { DBConfigComponent } from './interfaces';
import shuffle from 'lodash.shuffle';

export class Db extends Sequelize {
    constructor(config: DBConfigComponent, options?: { confAppend?: SequelizeOptions }) {
        let dialect: Dialect;
        switch (config.type) {
            case 'mysql':
                dialect = 'mariadb';
                break;
            case 'pgsql':
                dialect = 'postgres';
                break;
            default:
                dialect = config.type;
        }

        let slaves: ConnectionOptions[] = [];

        const validSlaves = (config.slaves ?? []).filter(({ weight }) => weight > 0);
        validSlaves.forEach(({ host, port, weight, username }) => {
            for (let i = 0; i < weight; i++) {
                slaves.push({ host, port, username });
            }
        });
        slaves = shuffle(slaves);

        const conf: SequelizeOptions = {
            database: config.database,
            username: config.master.username ?? 'root',
            password: config.master.password ?? '',
            dialect,
            timezone: 'UTC',
            dialectOptions: {
                useUTC: true,
                supportBigNumbers: true,
                connectTimeout: 10000,
            },
            // logs all queries
            logging: false,
            logQueryParameters: true,
            replication: {
                read: slaves,
                write: {
                    // name: 'master-' + config.master.host,
                    host: config.master.host,
                    port: config.master.port,
                },
            },
            pool: {
                min: 0,
                max: validSlaves.length + 1,
                idle: 1000,
                evict: 2000,
                maxUses: 100,
                validate: (client?: { isValid?: () => boolean; _connected?: boolean }) => {
                    if (dialect === 'postgres' && client?._connected) {
                        return client._connected;
                    }
                    if (client?.isValid) {
                        return client.isValid();
                    }
                    throw new Error('Todo');
                },
            },
            ...options?.confAppend,
        };

        super(conf);
    }
}
