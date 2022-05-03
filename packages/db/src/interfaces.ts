import { Dialect } from '@sequelize/core';

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
