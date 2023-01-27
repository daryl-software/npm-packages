import { Sequelize, QueryOptionsWithType, QueryTypes, Model, QueryOptionsWithModel, CreationAttributes } from '@sequelize/core';
import md5 from 'md5';
import { CacheOptions } from './interfaces';
import { Cluster, Redis } from 'ioredis';
import { hydrateModel } from '@daryl-software/db';

export class DbFactoryCache {
    private readonly component: Sequelize;
    protected cachePrefix = 'DbFactoryCache';
    private redis: Cluster | Redis;

    constructor(component: Sequelize, redis: Cluster | Redis) {
        this.component = component;
        this.redis = redis;
    }

    private cached<T extends CacheOptions>(key: string, options: T): Promise<T extends { clear: true } | { skip: true } ? null : string | null> {
        if (options.clear) {
            void this.redis.del(key);
            return Promise.resolve(null);
        }
        if (options.skip) {
            return Promise.resolve(null);
        }

        // todo offer local in memory or redis back end
        return this.redis.get(key) as any;
    }

    private key<M extends Model | QueryTypes>(sql: string, options: M extends Model ? QueryOptionsWithModel<M> : M extends QueryTypes ? QueryOptionsWithType<M> : never): string {
        const key = [this.cachePrefix, this.component.config.database];

        if ('model' in options) {
            key.push(options.model.name);
        }

        key.push(md5([sql, JSON.stringify(options)].join('__')));

        return key.join('::');
    }

    async query<T extends object>(sql: string, options: QueryOptionsWithType<QueryTypes.SELECT> & { plain: true }, cOptions: CacheOptions): Promise<T>;
    async query<T extends object>(sql: string, options: QueryOptionsWithType<QueryTypes.SELECT>, cOptions: CacheOptions): Promise<T[]>;
    async query<T extends object>(sql: string, options: QueryOptionsWithType<QueryTypes.SELECT>, cOptions: CacheOptions): Promise<T[] | T> {
        const key = this.key(sql, options);

        const cache = await this.cached(key, cOptions);
        if (cOptions.clear) {
            return [];
        }

        if (cache !== null) {
            return JSON.parse(cache) as T;
        }

        const results = await this.component.query<T>(sql, options);
        await this.redis.set(key, JSON.stringify(results), 'EX', cOptions.ttl);
        return results;
    }

    async queryModel<M extends Model, Options extends QueryOptionsWithModel<M> & { plain?: true }, XOptions extends CacheOptions>(
        sql: `SELECT ${string}`, // could be improved to handle more complex queries
        options: Options,
        cOptions: XOptions
    ): Promise<XOptions extends { clear: true } ? undefined : Options extends { plain: true } ? M[] : M> {
        const key = this.key(sql, options);
        const cache = await this.cached(key, cOptions);
        if (cOptions.clear) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return;
        }

        if (cache !== null) {
            console.log({ cache });
            return (JSON.parse(cache) as CreationAttributes<M>[]).map((obj) => hydrateModel(options.model, obj)) as any;
        }
        const result = await this.component.query(sql, options);
        if (options.plain && result instanceof Model) {
            await this.redis.set(key, JSON.stringify(result.get({ plain: true })), 'EX', cOptions.ttl);
        } else {
            await this.redis.set(key, JSON.stringify(result.map((o) => o.get({ plain: true }))), 'EX', cOptions.ttl);
        }

        return result as any;
    }
}
