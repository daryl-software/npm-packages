import { expect } from 'chai';
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

    before(async () => {
        await writeFile(
            testFile,
            JSON.stringify({
                rediscluster: {
                    servers: ['redis-cluster:7000', 'redis-cluster:7001'],
                },
            })
        );
        loader = new ConfigLoader([`${__dirname}/base.json`, testFile], { verbose: true });
    });

    after(async () => {
        await unlink(testFile).catch(() => {
            //
        });
    });

    it('Config Simple load', async () => {
        const doge = loader.get<TestConfig['$DOGE']>('$DOGE');
        expect(doge).to.eq('🚀 > 🌙');
        const cluster = loader.get<TestConfig['rediscluster']>('rediscluster');
        expect(cluster.servers).to.length(2);
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
        expect(cluster.servers).to.length(2, 'Length before edit');
        await new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 180));
        expect(cluster.servers).to.length(3, 'Length after edit');
        expect(observerCalled).to.be.true;
    });
});
