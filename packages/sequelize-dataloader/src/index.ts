import { CustomNotFound, NotFoundError } from '@ezweb/redis-dataloader';
import { FindOptions, Model, ModelCtor } from 'sequelize';
import DataLoader from 'dataloader';
export * from './batch-loader';
export * from './multiple';
export * from './single';

export class ModelNotFoundError<M extends Model> extends NotFoundError {
    model: ModelCtor<M>;

    constructor(model: ModelCtor<M>, identifier: unknown) {
        super(identifier, `${model.name} not found for identifier ${JSON.stringify(identifier)}`);

        this.model = model;
    }

    toJSON() {
        return {
            message: this.message,
            identifier: this.key,
        };
    }
}

export interface SequelizeModelDataloaderOptions<K, V extends Model> extends CustomNotFound<K> {
    find?: FindOptions<V>; // default where
}

export interface SequelizeSingleModelDataloaderOptions<K, V extends Model, C = K> extends SequelizeModelDataloaderOptions<K, V>, DataLoader.Options<K, V, C> {}

export interface SequelizeMultipleModelDataloaderOptions<K, V extends Model, C = K> extends SequelizeModelDataloaderOptions<K, V>, DataLoader.Options<K, V[], C> {}
