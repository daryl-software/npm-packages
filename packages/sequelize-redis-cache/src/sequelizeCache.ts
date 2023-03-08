import { Attributes, CreationAttributes, FindOptions, Model, ModelStatic } from '@sequelize/core';
import clone from 'lodash.clonedeep';
import md5 from 'md5';
import assert from 'assert';
import { Cluster, Redis } from 'ioredis';
import { hydrateModel } from '@daryl-software/db';
import { CacheOptions } from './interfaces';

// todo use declare module instead
interface ExposingModelPrivateMethod {
    queryGenerator: { selectQuery: (tablename: string, opts: object | undefined, defition: ModelStatic<Model>) => string };
}

export class SequelizeCache<T extends Model> {
    private readonly modelDef: ModelStatic<T> & ExposingModelPrivateMethod;
    private readonly cachePrefix = 'SequelizeCache';
    private redis: Cluster | Redis;

    constructor(modelDef: ModelStatic<T>, redis: Cluster | Redis) {
        this.redis = redis;
        this.modelDef = modelDef as ModelStatic<T> & ExposingModelPrivateMethod;
    }

    private get entityName(): string {
        return this.modelDef.name;
    }

    private getSql(type: { rawSql?: string; options?: FindOptions<Attributes<T>> }): string {
        let sql = type.rawSql;

        if (!sql) {
            const opts = clone(type.options);
            sql = this.modelDef.queryGenerator.selectQuery(this.modelDef.table.tableName, opts, this.modelDef);
        }

        assert(sql, new Error('Cannot get sql'));

        return sql;
    }

    async findAll(find: FindOptions<Attributes<T>>, options: CacheOptions): Promise<T[]> {
        const sql = this.getSql({ options: find });

        const key = this.key(sql, 'findAll');
        const cache = await this.cached(key, options);

        if (cache !== null) {
            return (JSON.parse(cache) as CreationAttributes<T>[]).map((item) => hydrateModel(this.modelDef, item));
        }

        const results = await this.modelDef.findAll(find);
        if ('ttl' in options) {
            await this.redis.set(key, JSON.stringify(results.map((o) => o.get({ plain: true }))), 'EX', options.ttl);
        }
        return results;
    }

    async count(find: FindOptions<Attributes<T>>, options: CacheOptions): Promise<number> {
        const sql = this.getSql({ options: find });
        const key = this.key(sql, 'count');

        const cache = await this.cached(key, options);

        if (cache !== null) {
            return Number(cache);
        }

        const results = await this.modelDef.count(find);
        if ('ttl' in options) {
            await this.redis.set(key, results, 'EX', options.ttl);
        }

        return results;
    }

    key(sql: string, method: string): string {
        return [this.cachePrefix, this.entityName, method, md5(sql)].join(':');
    }

    protected cached(key: string, options: CacheOptions): Promise<string | null> {
        if ('skip' in options && options.skip) {
            return Promise.resolve(null);
        }

        // todo offer local in memory or redis back end
        return this.redis.get(key);
    }
}
