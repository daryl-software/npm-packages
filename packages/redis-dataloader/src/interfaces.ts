import { Cluster, Redis } from 'ioredis';
import { NotFoundError } from '@ezweb/error';

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

export interface RedisDataloaderOptionsRequired<K, V> extends RedisDataloaderOptions<K, V> {
    redis: Pick<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'> & Required<Omit<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'>>;
}
