import { writeFile, unlink } from 'fs/promises';
import { ConfigLoader } from '..';
import { randomUUID } from 'crypto';

type TestConfig = {
    arsonik: boolean;
    $DOGE: string;
    rediscluster: {
        servers: string[];
    };
};

describe('Config Loader', async () => {
    const testFile = `${__dirname}/${randomUUID()}.json`;
    let loader: ConfigLoader;

    beforeAll(async () => {
        await writeFile(
            testFile,
            JSON.stringify({
                rediscluster: {
                    servers: ['redis-cluster:7000', 'redis-cluster:7001'],
                },
            })
        );
        loader = new ConfigLoader([`${__dirname}/base.json`, testFile], { verbose: true });
        loader.addObserver('db', () => {})
    });

    afterAll(async () => {
        await unlink(testFile).catch(() => {
            //
        });
    });

    it('Config Simple load', async () => {
        const doge = loader.get<TestConfig['$DOGE']>('$DOGE');
        expect(doge).toEqual('🚀 > 🌙');
        const cluster = loader.get<TestConfig['rediscluster']>('rediscluster');
        expect(cluster.servers.length).toEqual(2);
    });

    it('Config Watch for change', async () => {
        let cluster = loader.get<TestConfig['rediscluster']>('rediscluster');
        let observerCalled = false;
        loader.addObserver<TestConfig['rediscluster']>('rediscluster', (all) => {
            cluster = all;
            observerCalled = true;
        });

        setTimeout(() => {
            writeFile(
                testFile,
                JSON.stringify({
                    rediscluster: {
                        servers: ['redis-cluster:7000', 'redis-cluster:7001', 'redis-cluster:7003'],
                    },
                })
            );
        }, 50);
        expect(cluster.servers.length).toEqual(2);
        await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 180));
        expect(cluster.servers.length).toEqual(3);
        expect(observerCalled).toEqual(true);
    });
});
