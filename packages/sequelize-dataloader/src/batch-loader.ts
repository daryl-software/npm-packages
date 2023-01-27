/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FindOptions, Model, ModelStatic, Op } from '@sequelize/core';
import { CustomNotFound } from '@daryl-software/redis-dataloader';
import { ModelNotFoundError } from '@daryl-software/error';

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

export async function BatchLoaderMultiColumns<M extends Model, K extends keyof M, Mode extends 'filter' | 'find'>(
    model: ModelStatic<M>,
    columns: K[],
    values: readonly Pick<M, K>[],
    mode: Mode,
    options: BatchLoaderOptions<M> = {}
): Promise<((Mode extends 'filter' ? M[] : M) | Error)[]> {
    const models = await model.findAll({
        ...options.find,
        where: { ...options.find?.where, [Op.or]: StrictValues(columns, values) },
    });
    const nColumns = columns.length;
    if (mode === 'filter') {
        // @ts-ignore
        return values.map(
            (value) => models.filter((result) => columns.filter((column) => result[column] === value[column]).length === nColumns) ?? options.notFound?.(value) ?? new ModelNotFoundError(model, value)
        );
    } else {
        // @ts-ignore
        return values.map(
            (value) => models.find((result) => columns.filter((column) => result[column] === value[column]).length === nColumns) ?? options.notFound?.(value) ?? new ModelNotFoundError(model, value)
        );
    }
}

export async function BatchLoader<M extends Model, K extends keyof M, Mode extends 'filter' | 'find'>(
    model: ModelStatic<M>,
    key: K,
    keys: readonly M[K][],
    mode: Mode,
    options: BatchLoaderOptions<M> = {}
): Promise<Mode extends 'find' ? (M | Error)[] : (M[] | Error)[]> {
    const models = await model.findAll({ ...options.find, where: { ...options.find?.where, [key]: keys } });
    if (mode === 'find') {
        // @ts-ignore
        return keys.map((akey) => models.find((result) => result[key] === akey) ?? options.notFound?.(akey) ?? new ModelNotFoundError(model, akey));
    } else {
        // @ts-ignore
        return keys.map((akey) => {
            const list = models.filter((result) => result[key] === akey);
            return list.length ? list : options.notFound?.(akey) ?? new ModelNotFoundError(model, akey);
        });
    }
}
