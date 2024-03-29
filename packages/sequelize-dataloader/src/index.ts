import { Model } from '@sequelize/core';
import DataLoader from 'dataloader';
import { BatchLoaderOptions } from './batch-loader';
export * from './batch-loader';
export * from './multiple';
export * from './single';
export * from './json';

export interface SequelizeModelDataloaderOptions<K, V extends Model, C = K, X = V | V[]> extends BatchLoaderOptions<V>, DataLoader.Options<K, X, C> {}
