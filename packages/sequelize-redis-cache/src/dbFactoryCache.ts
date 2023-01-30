/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CreationAttributes, Model, QueryOptionsWithModel, QueryOptionsWithType, QueryTypes, Sequelize } from '@sequelize/core';
import md5 from 'md5';
import { CacheOptions } from './interfaces';
import { Cluster, Redis } from 'ioredis';
import { hydrateModel } from '@daryl-software/db';
import { QueryOptions } from '@sequelize/core/types/dialects/abstract/query-interface';

export class DbFactoryCache {
    private readonly component: Sequelize;
    protected cachePrefix = 'DbFactoryCache';
    private redis: Cluster | Redis;

    constructor(component: Sequelize, redis: Cluster | Redis) {
        this.component = component;
        this.redis = redis;
    }

    private cached<T extends CacheOptions>(key: string, options: T): Promise<T extends { clear: true } | { skip: true } ? null : string | null> {
        if ('clear' in options && options.clear) {
            void this.redis.del(key);
            return Promise.resolve(null);
        }
        if ('skip' in options && options.skip) {
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

    async query(query: string, options: QueryOptions, cOptions: { clear: true }): Promise<undefined>;
    async query<TReturn extends object>(query: string, options: QueryOptions, cOptions: CacheOptions): Promise<TReturn[]>;
    async query<TReturn extends object>(query: string, options: QueryOptions & { plain: true }, cOptions: CacheOptions): Promise<TReturn>;
    async query<TReturn extends object>(query: string, options: QueryOptions = {}, cOptions: CacheOptions): Promise<any> {
        const koptions: QueryOptionsWithType<QueryTypes.SELECT> = { ...options, type: QueryTypes.SELECT };
        const key = this.key(query, koptions);

        const cache = await this.cached(key, cOptions);
        if ('clear' in cOptions && cOptions.clear) {
            return;
        }

        if (cache !== null) {
            return JSON.parse(cache);
        }

        const results = await this.component.query<TReturn>(query, koptions);
        if ('ttl' in cOptions) {
            await this.redis.set(key, JSON.stringify(results), 'EX', cOptions.ttl);
        }
        return results as any;
    }

    async queryModel<M extends Model>(sql: `SELECT ${string}`, options: QueryOptionsWithModel<M>, cOptions: { clear: true }): Promise<undefined>;
    async queryModel<M extends Model>(sql: `SELECT ${string}`, options: QueryOptionsWithModel<M> & { plain: true }, cOptions: CacheOptions): Promise<M>;
    async queryModel<M extends Model>(sql: `SELECT ${string}`, options: QueryOptionsWithModel<M>, cOptions: CacheOptions): Promise<M[]>;
    async queryModel<M extends Model>(sql: `SELECT ${string}`, options: QueryOptionsWithModel<M>, cOptions: CacheOptions): Promise<any> {
        const key = this.key(sql, options);
        const cache = await this.cached(key, cOptions);
        if ('clear' in cOptions && cOptions.clear) {
            return undefined;
        }

        if (cache !== null) {
            return (JSON.parse(cache) as CreationAttributes<M>[]).map((obj) => hydrateModel(options.model, obj)) as any;
        }
        const result = await this.component.query(sql, options);
        if (options.plain && result instanceof Model && 'ttl' in cOptions) {
            await this.redis.set(key, JSON.stringify(result.get({ plain: true })), 'EX', cOptions.ttl);
        } else if ('ttl' in cOptions) {
            await this.redis.set(key, JSON.stringify(result.map((o) => o.get({ plain: true }))), 'EX', cOptions.ttl);
        }

        return result as any;
    }
}
