import { Cluster, Redis } from 'ioredis';
import { NotFoundError } from '@daryl-software/error';

export interface CustomNotFound<T> {
    notFound?: (key: T) => NotFoundError;
}

export interface RedisDataloaderOptions<K, V> {
    redis: {
        suffix?: string;
        client: Redis | Cluster;
        ttl: number;
        ttlNotFound?: number; // default to 60sec
        deserialize?: (key: K, data: string) => V | Error;
        serialize?: (value: V) => string;
        logging?: (...args: unknown[]) => void;
    };
}

type Keys = 'logging' | 'suffix' | 'ttlNotFound';

export type RedisDataloaderOptionsRequired<K, V> = {
    redis: Pick<RedisDataloaderOptions<K, V>['redis'], Keys> & Required<Omit<RedisDataloaderOptions<K, V>['redis'], Keys>>;
};
