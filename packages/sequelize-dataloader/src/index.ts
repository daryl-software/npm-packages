import { Model } from '@sequelize/core';
import DataLoader from 'dataloader';
import { BatchLoaderOptions } from './batch-loader';
export * from './batch-loader';
export * from './multiple';
export * from './single';

export interface SequelizeModelDataloaderOptions<K, V extends Model, C = K, X = V | V[]> extends BatchLoaderOptions<V, K>, DataLoader.Options<K, X, C> {}
