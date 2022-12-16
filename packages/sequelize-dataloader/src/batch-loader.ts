import { FindOptions, Model, ModelStatic, Op } from '@sequelize/core';
import { CustomNotFound } from '@ezweb/redis-dataloader';

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
): Promise<(M | undefined)[]>;
export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: 'filter',
    options?: BatchLoaderOptions<M>
): Promise<(M[] | undefined)[]>;
export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: 'find' | 'filter',
    options: BatchLoaderOptions<M> = {}
): Promise<(M[] | M | undefined)[]> {
    const models = await model.findAll({
        ...options.find,
        where: { ...options.find?.where, [Op.or]: StrictValues(columns, values) },
    });
    const nColumns = columns.length;
    if (mode === 'filter') {
        return values.map((value) => models.filter((result) => columns.filter((column) => result[column] === value[column]).length === nColumns));
    } else {
        return values.map((value) => models.find((result) => columns.filter((column) => result[column] === value[column]).length === nColumns));
    }
}

export async function BatchLoader<M extends Model, K extends keyof M>(model: ModelStatic<M>, key: K, keys: readonly M[K][], mode: 'find', options?: BatchLoaderOptions<M>): Promise<M[]>;
export async function BatchLoader<M extends Model, K extends keyof M>(model: ModelStatic<M>, key: K, keys: readonly M[K][], mode: 'filter', options?: BatchLoaderOptions<M>): Promise<M[][]>;
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
            const list = models.filter((result) => result[key] === akey);
            return list.length ? list : undefined;
        }
    });
}
