import { unlink, writeFile } from 'fs/promises';
import { ConfigLoader } from '../index';
import { randomUUID } from 'crypto';

type TestConfig = {
    arsonik: boolean;
    $DOGE: string;
    rediscluster: {
        servers: string[];
    };
};

describe('Config Loader',  () => {
    const testFile = `${__dirname}/${randomUUID()}.json`;
    let loader: ConfigLoader;

    beforeAll(async () => {
        await writeFile(
            testFile,
            '{"rediscluster":{"servers":["redis-cluster:7000","redis-cluster:7001"]}}'
        );
        loader = new ConfigLoader([`${__dirname}/test-config.json`, testFile], { verbose: false });
    });

    afterAll(async () => {
        await unlink(testFile);
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

        expect(cluster.servers.length).toEqual(2);
        setTimeout(async () => {
            jest.resetModules();
            await writeFile(
                testFile,
                '{"rediscluster":{"servers":["redis-cluster:7000","redis-cluster:7001","redis-cluster:7003"]}}'
            );
        }, 50);
        // Jest caches files
        //             jest.resetModules();
        expect(observerCalled).toEqual(false);
        expect(cluster.servers.length).toEqual(2);
    });
});
