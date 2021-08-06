import { Sequelize, Dialect, Model, DataTypes } from 'sequelize';

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

export type ImportableModel = (sequelize: Sequelize, dataTypes: typeof DataTypes) => typeof Model;

export interface ImportableType {
    model?: ImportableModel;
    modelsLoaded?: () => void;
}
