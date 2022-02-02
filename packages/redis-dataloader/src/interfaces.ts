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
        deserialize?: (key: K, data: string) => V | Promise<V> | Error;
        serialize?: (value: V) => string | Promise<string>;
        logging?: (...args: unknown[]) => void;
    };
}

export interface RedisDataloaderOptionsRequired<K, V> extends RedisDataloaderOptions<K, V> {
    redis: Pick<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'> & Required<Omit<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'>>;
}
