/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Attributes, FindOptions, Model, ModelStatic, Op } from '@sequelize/core';

function StrictValues<M extends Model, K extends keyof M>(columns: K[], values: readonly Pick<M, K>[]): Pick<M, K>[] {
    return values.map((value) => {
        const whereClause = {} as Pick<M, K>;
        columns.forEach((column) => (whereClause[column] = value[column]));
        return whereClause;
    });
}

export interface BatchLoaderOptions<M extends Model> {
    find?: FindOptions<Attributes<M>>;
}

export async function BatchLoaderMultiColumns<
    M extends Model,
    K extends keyof M,
    Mode extends 'filter' | 'find',
    Inter = Mode extends 'filter' ? M[] : Mode extends 'find' ? M : never,
    Return = (Inter | undefined)[]
>(model: ModelStatic<M>, columns: K[], values: readonly Pick<M, K>[], mode: Mode, options: BatchLoaderOptions<M> = {}): Promise<Return> {
    const models: M[] = await model.findAll({
        ...options.find,
        // @ts-ignore
        where: { ...options.find?.where, [Op.or]: StrictValues(columns, values) },
    });
    const nColumns = columns.length;
    if (mode === 'filter') {
        // @ts-ignore
        return values.map((value) => {
            const found = models.filter((result) => columns.filter((column) => result[column] === value[column]).length === nColumns);
            return found.length ? found : undefined;
        });
    } else if (mode === 'find') {
        // @ts-ignore
        return values.map((value) => models.find((result) => columns.filter((column) => result[column] === value[column]).length === nColumns));
    }
    throw new Error('Invalid mode');
}

export async function BatchLoader<M extends Model, K extends keyof M, Mode extends 'filter' | 'find'>(
    model: ModelStatic<M>,
    key: K,
    keys: readonly M[K][],
    mode: Mode,
    options: BatchLoaderOptions<M> = {}
): Promise<Mode extends 'find' ? (M | undefined)[] : (M[] | undefined)[]> {
    // @ts-ignore
    const models = await model.findAll({ ...options.find, where: { ...options.find?.where, [key]: keys } });
    if (mode === 'find') {
        // @ts-ignore
        return keys.map((akey) => models.find((result) => result[key] === akey));
    } else {
        // @ts-ignore
        return keys.map((akey) => {
            const list = models.filter((result) => result[key] === akey);
            return list.length ? list : undefined;
        });
    }
}
