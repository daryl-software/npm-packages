/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Model, ModelStatic } from '@sequelize/core';
import { RedisDataLoader, RedisDataloaderOptions } from '@daryl-software/redis-dataloader';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@daryl-software/db';
import { SequelizeModelDataloaderOptions } from './index';
import { ModelNotFoundError } from '@daryl-software/error';

export function SingleDataloader<
    V extends Model,
    K extends keyof V,
    Key extends K | K[],
    KeyToLoad extends Pick<V, K> | V[K], // can be a single key (id) or a combination of keys [id, email]
    Options extends SequelizeModelDataloaderOptions<KeyToLoad, V, string, V> & Partial<RedisDataloaderOptions<KeyToLoad, V>>,
    BatchFn = (keys: readonly KeyToLoad[]) => KeyToLoad extends V[K] ? typeof BatchLoader<V, K, 'filter'> : typeof BatchLoaderMultiColumns<V, K, 'filter'>,
    Return = Options extends RedisDataloaderOptions<KeyToLoad, V> ? RedisDataLoader<KeyToLoad, V, string> : DataLoader<KeyToLoad, V, string>
>(model: ModelStatic<V>, key: Key, options?: Options): Return {
    let batchLoadFn: BatchFn;
    let cacheKeyFn: (keyToLoad: KeyToLoad) => string;
    if (Array.isArray(key)) {
        batchLoadFn = ((keys: readonly Pick<V, K>[]) => BatchLoaderMultiColumns(model, key, keys, 'find', options)) as BatchFn;
        cacheKeyFn = (ak) => key.map((o) => (ak as Pick<V, K>)[o]).join(',');
    } else {
        // @ts-ignore
        batchLoadFn = (keys: readonly V[K][]) => BatchLoader(model, key, keys, 'find', options) as BatchFn;
        cacheKeyFn = (ak) => JSON.stringify(ak);
    }
    if (options && 'redis' in options) {
        // @ts-ignore
        return new RedisDataLoader<K, V>(`${model.name}-${key.toString()}`, batchLoadFn, {
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
        // @ts-ignore
        return new DataLoader<KeyToLoad, V, string>(
            (keys) =>
                // @ts-ignore
                batchLoadFn(keys).then((values) =>
                    keys.map((k, i) => {
                        if (values[i] === undefined || values[i] === null) {
                            return options?.notFound?.(k) ?? new ModelNotFoundError(model, k);
                        }
                        return values[i];
                    })
                ),
            { cacheKeyFn, ...options }
        );
    }
}
