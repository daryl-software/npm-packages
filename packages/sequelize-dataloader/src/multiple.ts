import { CreationAttributes, Model, ModelStatic } from '@sequelize/core';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@ezweb/db';
import { RedisDataLoader, RedisDataloaderOptions } from '@ezweb/redis-dataloader';
import { SequelizeMultipleModelDataloaderOptions } from './index';
import { ModelNotFoundError, NotFoundError } from '@ezweb/error';

export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelStatic<V>,
    key: K[],
    options: SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K>>(
    model: ModelStatic<V>,
    key: K[],
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string>
): DataLoader<A, V[]>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelStatic<V>,
    key: K,
    options: SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>
): RedisDataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends V[K]>(
    model: ModelStatic<V>,
    key: K,
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string>
): DataLoader<A, V[], string>;
export function MultipleDataloader<K extends keyof V, V extends Model, A extends Pick<V, K> | V[K]>(
    model: ModelStatic<V>,
    key: K | K[],
    options?: SequelizeMultipleModelDataloaderOptions<A, V, string> | (SequelizeMultipleModelDataloaderOptions<A, V, string> & RedisDataloaderOptions<A, V>)
): DataLoader<A, V[], string> {
    let batchLoadFn: (keys: readonly any[]) => Promise<(V[] | undefined | Error)[]>;
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
            notFound: (akey) => new ModelNotFoundError(model, akey),
            maxBatchSize: 100,
            ...options,
            redis: {
                ...options.redis,
                deserialize: (_, json) => (JSON.parse(json) as CreationAttributes<V>[]).map((entry) => hydrateModel(model, entry)),
                serialize: (data) => JSON.stringify(data.map((o) => o.get({ plain: true }))),
            },
        });
    } else {
        return new DataLoader<A, V[], string>(
            (keys) =>
                batchLoadFn(keys).then(
                    (values) =>
                        keys.map((k, i) => {
                            if (!Array.isArray(values[i]) || !(values[i] as V[]).length) {
                                return options?.notFound?.(k) ?? new NotFoundError(k, 'Not found');
                            }
                            return values[i];
                        }) as Exclude<V[], undefined>[]
                ),
            { cacheKeyFn, ...options }
        );
    }
}
