import { Cluster, Redis } from 'ioredis';

export interface CustomNotFound<T> {
    notFound?: (key: T) => NotFoundError;
}

export class NotFoundError extends Error {
    key: unknown;

    constructor(key: unknown, message: string) {
        super(message);
        this.key = key;
    }
}

export interface RedisDataloaderOptions<K, V> {
    redis: {
        suffix?: string;
        client: Redis | Cluster;
        ttl: number;
        deserialize?: (key: K, data: string) => V | Error;
        serialize?: (value: V) => string;
        logging?: (...args: unknown[]) => void;
    };
}

export interface RedisDataloaderOptionsRequired<K, V> extends RedisDataloaderOptions<K, V> {
    redis: Pick<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'> & Required<Omit<RedisDataloaderOptions<K, V>['redis'], 'logging' | 'suffix'>>;
}
