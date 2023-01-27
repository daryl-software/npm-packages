/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CreationAttributes, Model, ModelStatic } from '@sequelize/core';
import DataLoader from 'dataloader';
import { BatchLoader, BatchLoaderMultiColumns } from './batch-loader';
import { hydrateModel } from '@daryl-software/db';
import { RedisDataLoader, RedisDataloaderOptions } from '@daryl-software/redis-dataloader';
import { SequelizeModelDataloaderOptions } from './index';
import { ModelNotFoundError } from '@daryl-software/error';

// given User = { id: number, email: string, other: string }
// MultipleDataloader(User, ['id', 'email'], options) - loader.load({ id: 1, email: 'xxx' })
// MultipleDataloader(User, 'id', options) - loader.load({ id: 1, email: 'xxx' })
export function MultipleDataloader<
    M extends Model,
    MKey extends keyof M,
    KeyOrKeys extends MKey | MKey[], // [id, email] or id
    KeyToLoad extends KeyOrKeys extends MKey[] ? Pick<M, MKey> : M[MKey], // { id: 1, email: 'xxx' } or 1
    MinOptions extends SequelizeModelDataloaderOptions<KeyToLoad, M, string, M[]>,
    WithRedisOptions extends MinOptions & RedisDataloaderOptions<KeyToLoad, M>,
    Options extends MinOptions | WithRedisOptions,
    TBatchLoader = KeyOrKeys extends MKey ? typeof BatchLoader<M, MKey, 'filter'> : typeof BatchLoaderMultiColumns<M, MKey, 'filter'>,
    RedisReturn = RedisDataLoader<KeyToLoad, M[], string>,
    RegularReturn = DataLoader<KeyToLoad, M[], string>
>(model: ModelStatic<M>, key: KeyOrKeys, options?: Options): Options extends WithRedisOptions ? RedisReturn : RegularReturn {
    let batchLoadFn: (keys: readonly KeyToLoad[]) => TBatchLoader;
    let cacheKeyFn: (keyToLoad: KeyToLoad) => string;

    if (Array.isArray(key)) {
        batchLoadFn = ((keys: readonly Pick<M, MKey>[]) => BatchLoaderMultiColumns(model, key, keys, 'filter', options)) as any;
        cacheKeyFn = (ak) => key.map((o) => (ak as Pick<M, MKey>)[o]).join(',');
    } else {
        batchLoadFn = ((keys: readonly M[MKey][]) => BatchLoader(model, key as MKey, keys, 'filter', options)) as any;
        cacheKeyFn = (ak) => JSON.stringify(ak);
    }
    if (options && 'redis' in options) {
        // @ts-ignore
        return new RedisDataLoader<MKey, M[]>(`${model.name}-${key.toString()}-MULTI`, batchLoadFn, {
            cacheKeyFn,
            notFound: (akey) => new ModelNotFoundError(model, akey),
            maxBatchSize: 100,
            ...options,
            redis: {
                ...options.redis,
                deserialize: (_, json) => (JSON.parse(json) as CreationAttributes<M>[]).map((entry) => hydrateModel(model, entry)),
                serialize: (data) => JSON.stringify(data.map((o) => o.get({ plain: true }))),
            },
        }) as any;
    } else {
        // @ts-ignore
        return new DataLoader<KeyToLoad, M[], string>(
            (keys) =>
                // @ts-ignore
                batchLoadFn(keys).then((values) =>
                    keys.map((k, i) => {
                        if (!Array.isArray(values[i]) || !values[i].length) {
                            return options?.notFound?.(k) ?? new ModelNotFoundError(model, k);
                        }
                        return values[i];
                    })
                ),
            { cacheKeyFn, ...options }
        );
    }
}
