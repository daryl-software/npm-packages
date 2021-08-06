import { Sequelize } from 'sequelize';
import { Cluster } from 'ioredis';
import { before } from 'mocha';
import config from './config.json';

export let queryCount = 0;
export const sequelize = new Sequelize('sqlite::memory:', {
    logging: () => {
        queryCount++;
        // console.log('SQL Query', query);
    },
});

export const redisCluster = new Cluster(
    config.rediscluster.servers.map((server) => {
        if (process.env['USE_LOCALHOST'] === 'yes' || 1) {
            server.host = 'localhost';
        }
        return server;
    })
);

before(() => Promise.resolve(true));
after(() => {
    redisCluster.disconnect();
    sequelize.close();
});
