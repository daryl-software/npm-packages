import { Model, ModelStatic } from '@sequelize/core';
import { RedisDataLoader, RedisDataloaderOptions } from '@ezweb/redis-dataloader';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@ezweb/db';
import { SequelizeSingleModelDataloaderOptions } from './index';
import { ModelNotFoundError } from '@ezweb/error';

export function SingleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelStatic<V>,
    key: K[],
    options: SequelizeSingleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V, string>;
export function SingleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelStatic<V>,
    key: K[],
    options?: SequelizeSingleModelDataloaderOptions<A, V, string>
): DataLoader<A, V, string>;
export function SingleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelStatic<V>,
    key: K,
    options: SequelizeSingleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V, string>;
export function SingleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelStatic<V>,
    key: K,
    options?: SequelizeSingleModelDataloaderOptions<A, V, string>
): DataLoader<A, V, string>;
export function SingleDataloader<K extends keyof V, V extends Model, A>(
    model: ModelStatic<V>,
    key: K | K[],
    options?: SequelizeSingleModelDataloaderOptions<A, V, string> | (SequelizeSingleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>)
) {
    let batchLoadFn: (keys: readonly any[]) => Promise<(V | Error)[]>;
    let cacheKeyFn: (k: any) => string;
    if (Array.isArray(key)) {
        batchLoadFn = (keys: readonly Pick<V, K>[]) => BatchLoaderMultiColumns(model, key, keys, 'find', options);
        cacheKeyFn = (ak: any) => key.map((o) => ak[o]).join(',');
    } else {
        batchLoadFn = (keys: readonly V[K][]) => BatchLoader(model, key, keys, 'find', options);
        cacheKeyFn = (ak: A) => JSON.stringify(ak);
    }
    if (options && 'redis' in options) {
        return new RedisDataLoader(`${model.name}-${key.toString()}`, batchLoadFn, {
            cacheKeyFn,
            notFound: (akey) => new ModelNotFoundError(model, akey),
            ...options,
            redis: {
                deserialize: (_, json) => hydrateModel(model, JSON.parse(json)),
                serialize: (data) => JSON.stringify(data.get({ plain: true })),
                ...options.redis,
            },
        });
    } else {
        return new DataLoader<A, V, string>(batchLoadFn, { cacheKeyFn, ...options });
    }
}
