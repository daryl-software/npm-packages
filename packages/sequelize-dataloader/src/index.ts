import { CustomNotFound } from '@daryl-software/redis-dataloader';
import { FindOptions, Model } from '@sequelize/core';
import DataLoader from 'dataloader';
export * from './batch-loader';
export * from './multiple';
export * from './single';

export interface SequelizeModelDataloaderOptions<K, V extends Model> extends CustomNotFound<K> {
    find?: FindOptions<V>; // default where
}

export interface SequelizeSingleModelDataloaderOptions<K, V extends Model, C = K> extends SequelizeModelDataloaderOptions<K, V>, DataLoader.Options<K, V, C> {}

export interface SequelizeMultipleModelDataloaderOptions<K, V extends Model, C = K> extends SequelizeModelDataloaderOptions<K, V>, DataLoader.Options<K, V[], C> {}
