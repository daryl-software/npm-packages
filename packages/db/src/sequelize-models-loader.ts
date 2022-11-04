/* eslint-disable no-console */
import glob from 'glob';
import { Sequelize, ModelStatic, Model, DataTypes, Dialect, ConnectionOptions, Options } from '@sequelize/core';
import shuffle from 'lodash.shuffle';
import { ConfigLoader } from '@ezweb/ts-config-loader';
import { DBConfigComponent, ImportableType } from './interfaces';
import { deepmerge } from 'deepmerge-ts';
import { Snitch } from './snitch';
import { DBSnitch } from './db-snitch';

type ComponentName = string;
type ModelName = string;
type DBConfig = Record<ComponentName, DBConfigComponent>;

export class SequelizeModelsLoader {
    private config: DBConfig;
    protected instances: Record<ComponentName, Sequelize> = {};
    public models: Record<ModelName, ModelStatic<Model>> = {};
    private inited = false;
    // `${projectRoot}/models/components/**/!(*.spec)*.ts` - must have component_name/model.ts files
    private regex: RegExp;

    constructor(
        private readonly globPattern: string,
        private readonly configLoader: ConfigLoader,
        private readonly configKey: string,
        private readonly snitch: Snitch,
        private readonly channelsList: number[],
        private readonly options?: { sequelizeOptions?: Options; componentsRegex?: RegExp; onError?: (component: string, sql: string | { query: string; values: unknown[] }, err: unknown) => void }
    ) {
        this.config = configLoader.get<DBConfig>(configKey);
        this.regex = options?.componentsRegex ?? new RegExp(/\/components\/(?<component>[^/]+)\/(?<model>.*).ts$/);
    }

    modelFiles(onlyComponents?: ComponentName[]) {
        return glob
            .sync(this.globPattern)
            .map((path) => ({ path, component: path.match(this.regex)?.groups?.component ?? '' }))
            .filter(({ component }) => component.length)
            .filter(({ component }) => !onlyComponents?.length || onlyComponents.includes(component));
    }

    async loadModels(onlyComponents?: ComponentName[]) {
        const callWhenLoaded: Function[] = [];
        await Promise.all(
            this.modelFiles(onlyComponents).map((item) => {
                const db = this.DbComponentByName(item.component);
                const x = setTimeout(() => {
                    console.error('❌ Model loading failed ?', item.path);
                }, 1000);
                return import(item.path).then((imported: ImportableType) => {
                    if (imported.channelized) {
                        this.channelsList.forEach((channelId) => imported.channelized?.(channelId)(db, DataTypes));
                    }
                    if (imported.modelsLoaded) {
                        callWhenLoaded.push(imported.modelsLoaded);
                    }
                    // initiliaze
                    imported.model?.(db, DataTypes);
                    clearTimeout(x);
                });
            })
        );
        this.models = Object.assign({}, ...Object.values(this.instances).map((db) => db.models));
        callWhenLoaded.forEach((fn) => {
            fn();
        });
        if (!this.inited) {
            this.configLoader.addObserver<DBConfig>(this.configKey, (updatedConfig, diff: unknown) => {
                this.config = updatedConfig;
                const componentsChanged = Object.keys(diff as {});
                console.info('Db config changed !', { componentsChanged });
                componentsChanged.forEach((comp) => this.DbComponentByName(comp, true));
                void this.loadModels(componentsChanged);
            });
            this.inited = true;
        }
        return this.models;
    }

    DbComponentByName(component: ComponentName, reload = false): Sequelize {
        if (reload) {
            void this.instances[component]?.close();
            delete this.instances[component];
        } else if (this.instances[component]) {
            return this.instances[component];
        }
        const logg = new DBSnitch(this.snitch, component);
        const configComponent = this.config[component];

        let dialect: Dialect;
        let dialectOptions = {};
        switch (configComponent.type) {
            case 'mysql':
                dialect = 'mariadb';
                break;
            case 'pgsql':
                dialect = 'postgres';
                break;
            default:
                dialect = configComponent.type;
        }
        if (dialect === 'mariadb') {
            // @see https://mariadb.com/kb/en/nodejs-connection-options/
            dialectOptions = {
                charset: 'utf8mb4',
                useUTC: true,
                supportBigNumbers: true,
                connectTimeout: 1000,
            };
        }

        let slaves: ConnectionOptions[] = [];

        (configComponent.slaves ?? [])
            .filter(({ weight }) => weight > 0)
            .forEach(({ host, port, weight, username }) => {
                for (let i = 0; i < weight; i++) {
                    slaves.push({ host, port, username });
                }
            });
        slaves = shuffle(slaves);

        this.instances[component] = new Sequelize(
            deepmerge(
                {
                    database: configComponent.database,
                    username: configComponent.master.username ?? 'root',
                    password: configComponent.master.password ?? '',
                    dialect,
                    timezone: 'UTC',
                    dialectOptions,
                    logQueryParameters: true,
                    replication: {
                        read: slaves,
                        write: {
                            host: configComponent.master.host,
                            port: configComponent.master.port,
                        },
                    },
                    logging: logg.logging.bind(logg),
                    benchmark: true,
                    pool: {
                        min: 0,
                        max: 200,
                        idle: 10000,
                        evict: 500,
                        acquire: 4000,
                        maxUses: 10000,
                    },
                    retry: {
                        match: [
                            /ConnectionError/,
                            /SequelizeConnectionError/,
                            /SequelizeConnectionRefusedError/,
                            /SequelizeHostNotFoundError/,
                            /SequelizeHostNotReachableError/,
                            /SequelizeInvalidConnectionError/,
                            /SequelizeConnectionTimedOutError/,
                            /SequelizeConnectionAcquireTimeoutError/,
                            /Connection terminated unexpectedly/,
                            /Deadlock found when trying to get lock/,
                            /Connection timeout: failed to create socket/,
                            /SQLState: 08S01/,
                        ],
                        max: 4,
                    },
                },
                this.options?.sequelizeOptions ?? {}
            )
        );
        type x = Parameters<typeof Sequelize.prototype.query>;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        instances[component].query = (sql: x[0], options?: x[1]) =>
            Sequelize.prototype.query.call(this.instances[component], sql, options).catch((err) => {
                this.options?.onError?.(component, sql, err);
                throw err;
            });

        return this.instances[component];
    }

    closeAllDbs() {
        return Promise.all(Object.values(this.instances).map((db) => db.close()));
    }

    modelChannelized<
        T extends ModelStatic<
            Model & {
                channelId: number;
            }
        >
    >(model: T, channelId: number) {
        return this.models[`${model.name}Ch${channelId}`] as T;
    }
}
