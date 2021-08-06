import { unlink, writeFile } from 'fs/promises';
import { ConfigLoader } from '../index';
import { randomUUID } from 'crypto';
import { before, after, it } from 'mocha';
import { expect } from 'chai';

type TestConfig = {
    arsonik: boolean;
    $DOGE: string;
    rediscluster: {
        servers: string[];
    };
};

describe('Config Loader', () => {
    const testFile = `${__dirname}/${randomUUID()}.json`;
    let loader: ConfigLoader;

    before(async () => {
        await writeFile(testFile, '{"rediscluster":{"servers":["redis-cluster:7000","redis-cluster:7001"]}}');
        loader = new ConfigLoader([`${__dirname}/test-config.json`, testFile], { verbose: true });
    });
    after(async () => {
        loader.close();
    });

    after(async () => {
        await unlink(testFile);
        loader.close();
    });

    it('Config Simple load', async () => {
        const doge = loader.get<TestConfig['$DOGE']>('$DOGE');
        expect(doge).to.eq('🚀 > 🌙');
        const cluster = loader.get<TestConfig['rediscluster']>('rediscluster');
        expect(cluster.servers.length).to.eq(2);
    });

    it('Config Watch for change', async () => {
        let cluster = loader.get<TestConfig['rediscluster']>('rediscluster');
        let observerCalled = false;
        loader.addObserver<TestConfig['rediscluster']>('rediscluster', (all) => {
            cluster = all;
            observerCalled = true;
        });

        expect(cluster.servers.length).to.eq(2);
        setTimeout(async () => {
            await writeFile(testFile, '{"rediscluster":{"servers":["redis-cluster:7000","redis-cluster:7001","redis-cluster:7003"]}}');
        }, 50);
        await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 180));

        expect(observerCalled).to.eq(true);
        expect(cluster.servers.length).to.eq(3);
    });
});
