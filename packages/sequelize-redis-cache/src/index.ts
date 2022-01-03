import { Model, QueryOptionsWithModel } from 'sequelize';

export * from './dbFactoryCache';
export * from './sequelizeCache';
export * from './interfaces';

// todo waiting merge on https://github.com/sequelize/sequelize/pull/12585
declare module 'sequelize/types/lib/sequelize' {
    interface Sequelize {
        query<M extends Model>(sql: string | { query: string; values: unknown[] }, options: QueryOptionsWithModel<M> & { plain: true }): Promise<M | null>;
    }
}
