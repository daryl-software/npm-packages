import { RedisDataLoader } from '@daryl-software/redis-dataloader';
import { Cluster } from 'ioredis';
import config from './config.json';
import data from './data.json';
import { NotFoundError } from '@daryl-software/error';
import { expect } from 'vitest';

export const redisCluster = new Cluster(
    config.rediscluster.servers.map((server) => {
        if (process.env['USE_LOCALHOST'] === 'yes' || 1) {
            server.host = 'localhost';
        }
        return server;
    })
);

class MyNotFoundError extends NotFoundError {}
type CountryCode = string;
type CountryName = string;

describe('redis-dataloader', async () => {
    let loaderUndef: RedisDataLoader<CountryCode, CountryName>;
    it('Custom redis dataloader', async () => {
        const loader = new RedisDataLoader<CountryCode, CountryName>(
            `Country@${Date.now()}`,
            async (isos) => isos.map((iso) => (data.countries as Record<string, string>)[iso] ?? new MyNotFoundError(iso, `${iso} not found`)),
            {
                maxBatchSize: 20,
                notFound: (key) => new MyNotFoundError(key, 'custom'),
                redis: {
                    client: redisCluster,
                    // eslint-disable-next-line no-console
                    logging: console.log.bind(console),
                    ttl: 5,
                    deserialize: (_, sum) => sum,
                    serialize: (data) => data,
                },
            }
        );
        loaderUndef = new RedisDataLoader(
            `CountryXX@${Date.now()}`,
            async (isos) => {
                const dataLocal: { countries: Record<CountryCode, CountryName> } = await import('./data.json');
                return isos.map((iso) => {
                    if (!(iso in dataLocal.countries)) {
                        return undefined;
                    }
                    return dataLocal.countries[iso];
                });
            },
            {
                redis: {
                    client: redisCluster,
                    deserialize: (_, sum) => sum,
                    serialize: (data) => data,
                },
            }
        );
        const notCached = await loader.loadCached('FR');
        await expect(loaderUndef.load('XX')).rejects.toThrow(NotFoundError);
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

    it('Exist loader', async () => {
        const loader = new RedisDataLoader<CountryCode, CountryName>(`Country@${Date.now()}Exist`, async (isos) => isos.map((iso) => (data.countries as Record<string, string>)[iso]), {
            maxBatchSize: 20,
            redis: {
                client: redisCluster,
                logging: console.log.bind(console),
                ttl: 5,
                deserialize: (key, country) => country,
                serialize: (country) => country,
            },
        });
        expect(await loader.exist('FR')).to.eq(true);
        expect(await loader.exist('XXX')).to.eq(false);
        expect(await loader.exist('FR')).to.eq(true); // cached
        expect(await loader.exist('XXX')).to.eq(false); // cached
    });
});
