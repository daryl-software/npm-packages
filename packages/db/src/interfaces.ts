import { Dialect, DataTypes, Model, Sequelize } from '@sequelize/core';

export type ImportableModel = (sequelize: Sequelize, dataTypes: typeof DataTypes) => typeof Model;
export type ImportableChannelizedModel = (channelId: number) => ImportableModel;

export interface HostPortCharset {
    host: string;
    port: number;
    charset: string;
}

export interface UserPassword {
    username?: string;
    password?: string;
}

export interface DBConfigComponent {
    type: Dialect | 'pgsql';
    database: string;
    master: HostPortCharset & UserPassword;
    slaves?: (HostPortCharset & UserPassword & { weight: number })[];
}

export interface ImportableType {
    model?: ImportableModel;
    channelized?: ImportableChannelizedModel;
    modelsLoaded?: () => void;
}
