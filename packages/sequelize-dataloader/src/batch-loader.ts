import { FindOptions, Model, ModelStatic, Op } from '@sequelize/core';
import { CustomNotFound } from '@ezweb/redis-dataloader';
import { ModelNotFoundError } from '@ezweb/error';

function StrictValues<M extends Model, K extends keyof M>(columns: K[], values: readonly Pick<M, K>[]): Pick<M, K>[] {
    return values.map((value) => {
        const whereClause: Pick<M, K> = {} as any;
        columns.forEach((column) => (whereClause[column] = value[column]));
        return whereClause;
    });
}

export interface BatchLoaderOptions<M extends Model, K = any> extends CustomNotFound<K> {
    find?: FindOptions<M>;
}

export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: 'find',
    options?: BatchLoaderOptions<M>
): Promise<(M | Error)[]>;
export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: 'filter',
    options?: BatchLoaderOptions<M>
): Promise<(M[] | Error)[]>;
export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: 'find' | 'filter',
    options: BatchLoaderOptions<M> = {}
): Promise<(M[] | M | Error)[]> {
    const models = await model.findAll({
        ...options.find,
        where: { ...options.find?.where, [Op.or]: StrictValues(columns, values) },
    });
    const nColumns = columns.length;
    return mode === 'filter'
        ? values.map(
              (value) =>
                  (models.filter((result) => columns.filter((column) => result[column] === value[column]).length === nColumns) || options.notFound?.(value)) ?? new ModelNotFoundError(model, value)
          )
        : values.map(
              (value) =>
                  (models.find((result) => columns.filter((column) => result[column] === value[column]).length === nColumns) || options.notFound?.(value)) ?? new ModelNotFoundError(model, value)
          );
}

export async function BatchLoader<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    key: K,
    keys: readonly M[K][],
    mode: 'find',
    options?: BatchLoaderOptions<M>
): Promise<(M | undefined | Error)[]>;
export async function BatchLoader<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    key: K,
    keys: readonly M[K][],
    mode: 'filter',
    options?: BatchLoaderOptions<M>
): Promise<(M[] | undefined | Error)[]>;
export async function BatchLoader<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    key: K,
    keys: readonly M[K][],
    mode: 'find' | 'filter',
    options: BatchLoaderOptions<M> = {}
): Promise<unknown> {
    const models = await model.findAll({ ...options.find, where: { ...options.find?.where, [key]: keys } });
    return keys.map((akey) => {
        if (mode === 'find') {
            return models.find((result) => result[key] === akey);
        } else {
            return models.filter((result) => result[key] === akey);
        }
    });
}
