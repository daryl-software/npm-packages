import { Model, ModelCtor } from 'sequelize';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@ezweb/db';
import { RedisDataLoader, RedisDataloaderOptions } from '@ezweb/redis-dataloader';
import { SequelizeMultipleModelDataloaderOptions } from './index';
import { ModelNotFoundError } from '@ezweb/error';

export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelCtor<V>,
    key: K[],
    options: SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelCtor<V>,
    key: K[],
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string>
): DataLoader<A, V[]>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelCtor<V>,
    key: K,
    options: SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelCtor<V>,
    key: K,
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string>
): DataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K> | V[K]>(
    model: ModelCtor<V>,
    key: K | K[],
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string> | (SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>)
): DataLoader<A, V[], string> {
    let batchLoadFn: (keys: readonly any[]) => Promise<(V[] | Error)[]>;
    let cacheKeyFn: (k: any) => string;
    if (Array.isArray(key)) {
        batchLoadFn = (keys: readonly Pick<V, K>[]) => BatchLoaderMultiColumns(model, key, keys, 'filter', options);
        cacheKeyFn = (ak: Pick<V, K>) => key.map((o) => ak[o]).join(',');
    } else {
        batchLoadFn = (keys: readonly V[K][]) => BatchLoader(model, key, keys, 'filter', options);
        cacheKeyFn = (ak: A) => JSON.stringify(ak);
    }
    if (options && 'redis' in options) {
        return new RedisDataLoader(`${model.name}-${key.toString()}-MULTI`, batchLoadFn, {
            cacheKeyFn,
            notFound: (key) => new ModelNotFoundError(model, key),
            maxBatchSize: 100,
            ...options,
            redis: {
                ...options.redis,
                deserialize: (_, json) => JSON.parse(json).map((entry: object) => hydrateModel(model, entry)),
                serialize: (data) => JSON.stringify(data.map((o) => o.get({ plain: true }))),
            },
        });
    } else {
        return new DataLoader<A, V[], string>(batchLoadFn, { ...options, cacheKeyFn });
    }
}
