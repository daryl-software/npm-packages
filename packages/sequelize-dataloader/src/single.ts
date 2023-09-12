/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Model, ModelStatic } from '@sequelize/core';
import { CustomNotFound, RedisDataLoader, RedisDataloaderOptions } from '@daryl-software/redis-dataloader';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@daryl-software/db';
import { JsonStringifyWithSymbols, SequelizeModelDataloaderOptions } from './index';
import { ModelNotFoundError } from '@daryl-software/error';

export function SingleDataloader<
    V extends Model,
    K extends keyof V,
    Key extends K | K[],
    KeyToLoad extends Pick<V, K> | V[K], // can be a single key (id) or a combination of keys [id, email]
    MinOptions extends SequelizeModelDataloaderOptions<KeyToLoad, V, string, V> & CustomNotFound<KeyToLoad>,
    WithRedisOptions extends MinOptions & RedisDataloaderOptions<KeyToLoad, V>,
    Options extends MinOptions | WithRedisOptions,
    BatchFn = (keys: readonly KeyToLoad[]) => KeyToLoad extends V[K] ? typeof BatchLoader<V, K, 'filter'> : typeof BatchLoaderMultiColumns<V, K, 'filter'>,
    Return = Options extends RedisDataloaderOptions<KeyToLoad, V> ? RedisDataLoader<KeyToLoad, V, string> : DataLoader<KeyToLoad, V, string>,
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
        const table = typeof model.getTableName() === 'string' ? model.getTableName() : [model.getTableName().schema, model.getTableName().tableName].filter(Boolean).join('.');
        const redisName = [table, key.toString(), options?.find ? JsonStringifyWithSymbols(options.find, true) : undefined].filter(Boolean).join('-').replace(/`/g, '');
        // @ts-ignore
        return new RedisDataLoader<K, V>(redisName, batchLoadFn, {
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
