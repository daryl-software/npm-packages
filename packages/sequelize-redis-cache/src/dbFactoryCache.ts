import { Sequelize, ModelCtor, QueryOptionsWithType, QueryTypes, Model, QueryOptionsWithModel } from 'sequelize';
import md5 from 'md5';
import { CacheOptions } from './interfaces';
import { Cluster, Redis } from 'ioredis';
import { hydrateModel } from '@ezweb/db';

export class DbFactoryCache {
    private readonly component: Sequelize;
    protected cachePrefix = 'DbFactoryCache';
    private redis: Cluster | Redis;

    constructor(component: Sequelize, redis: Cluster | Redis) {
        this.component = component;
        this.redis = redis;
    }

    private cached(key: string, options: CacheOptions): Promise<string | null> {
        if (options.clear === true) {
            this.redis.del(key);
            return Promise.resolve(null);
        }
        if (options.skip === true) {
            return Promise.resolve(null);
        }

        // todo offer local in memory or redis back end
        return this.redis.get(key);
    }

    private key<M extends Model>(sql: string, options: QueryOptionsWithModel<M>): string;
    private key<T extends QueryTypes>(sql: string, options: QueryOptionsWithType<T>): string;
    private key<M extends Model, T extends QueryTypes>(sql: string, options: QueryOptionsWithModel<M> | QueryOptionsWithType<T>): string {
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
        if (cOptions.clear === true) {
            return [];
        }

        if (cache !== null) {
            return JSON.parse(cache);
        }

        const results = await this.component.query<T>(sql, options);
        await this.redis.set(key, JSON.stringify(results), 'EX', cOptions.ttl);
        return results;
    }

    async queryModel<M extends Model>(sql: string, options: QueryOptionsWithModel<M> & { plain: true }, cOptions: CacheOptions): Promise<M>;
    async queryModel<M extends Model>(sql: string, options: QueryOptionsWithModel<M>, cOptions: CacheOptions): Promise<M[]>;
    async queryModel<M extends Model>(sql: string, options: QueryOptionsWithModel<M>, cOptions: CacheOptions): Promise<M[] | M> {
        const key = this.key(sql, options);
        const cache = await this.cached(key, cOptions);
        if (cOptions.clear === true) {
            return [];
        }

        if (cache !== null) {
            const modelctor = options.model as unknown as ModelCtor<M>;
            return JSON.parse(cache).map((obj: {}) => hydrateModel(modelctor, obj));
        }
        const result = await this.component.query(sql, options);
        if (options.plain && result instanceof Model) {
            await this.redis.set(key, JSON.stringify(result.get({ plain: true })), 'EX', cOptions.ttl);
        } else {
            await this.redis.set(key, JSON.stringify(result.map((o) => o.get({ plain: true }))), 'EX', cOptions.ttl);
        }

        return result;
    }
}
