import { expect } from 'chai';
import { describe, it } from 'mocha';
import { RedisDataLoader } from '@ezweb/redis-dataloader';
import { Cluster } from 'ioredis';
import config from './config.json';
import data from './data.json';
import { NotFoundError } from '@ezweb/error';

export const redisCluster = new Cluster(
    config.rediscluster.servers.map((server) => {
        if (process.env['USE_LOCALHOST'] === 'yes' || 1) {
            server.host = 'localhost';
        }
        return server;
    })
);

class MyNotFoundError extends NotFoundError {}

describe('redis-dataloader', async () => {
    it('Custom redis dataloader', async () => {
        type CountryCode = string;
        const loader = new RedisDataLoader<CountryCode, string>(
            `Country@${new Date().getTime()}`,
            async (isos) => isos.map((iso) => (data.countries as Record<string, string>)[iso] ?? new MyNotFoundError(iso, `${iso} not found`)),
            {
                maxBatchSize: 20,
                notFound: (key) => new MyNotFoundError(key, 'custom'),
                redis: {
                    client: redisCluster,
                    logging: console.log.bind(console),
                    ttl: 5,
                    deserialize: (_, sum) => sum,
                    serialize: (data) => data,
                },
            }
        );
        const notCached = await loader.loadCached('FR');
        expect(notCached[0].cached).to.be.false;
        expect(notCached[0].value).to.be.null;

        const res = await loader.loadMany(['FR', 'CH', 'XX']);
        expect(res[0]).to.eq('France');
        expect(res[1]).to.eq('Suisse');
        expect(res[2]).to.instanceof(MyNotFoundError);
        expect(await loader.load('FR')).to.eq('France');
        expect(await loader.load('XX').catch((e) => e)).to.instanceof(MyNotFoundError);

        const cached = await loader.loadCached('FR');
        expect(cached[0].cached).to.be.true;
        expect(cached[0].value).to.eq('France');

        expect(await loader.clearAsync('FR', 'CH', 'XX')).to.eq(3);

        await loader.primeAsync('FF', 'FranceFrance');
        expect(await loader.load('FF')).to.eq('FranceFrance');
    });
});
