import { Sequelize, DataTypes, Model, ModelStatic } from '@sequelize/core';
import { SingleDataloader, MultipleDataloader } from '../src';
import { redisCluster as client } from './init.spec';
import { ModelNotFoundError } from '@daryl-software/error';
import { RedisDataLoader } from '@daryl-software/redis-dataloader';
import DataLoader from 'dataloader';

export class UserNotFoundError<M extends Model = User> extends ModelNotFoundError<M> {
    id: number;
    constructor(model: ModelStatic<M>, identifier: number) {
        super(model, identifier);
        this.id = identifier;
    }
}

export class User extends Model {
    declare id: number;
    declare name: string;
    declare email: string;
    declare createdAt: Date;
    declare bornDate: Date;
    declare country: string;

    static loaderById: DataLoader<number, User>;
    static loaderByName: DataLoader<string, User[]>;
    static loaderByNameAndEmail: DataLoader<['name', 'country'], User>;
    static loaderFrenchNames: DataLoader<string, User[]>;
    static loaderByNameAndCountry: DataLoader<['name', 'country'], User[]>;

    static redisLoaderById: RedisDataLoader<number, User>;
    static redisLoaderByName: RedisDataLoader<string, User>;
    static redisLoaderByNameFrench: RedisDataLoader<string, User>;
    static redisLoaderByNameAndEmail: RedisDataLoader<['name', 'email'], User>;
    static redisLoaderByNameAndCountry: RedisDataLoader<['name', 'country'], User[]>;
}

export const model = (sequelize: Sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            status: {
                type: DataTypes.ENUM('enabled', 'disabled', 'pending'),
                allowNull: false,
                defaultValue: 'enabled',
            },
            name: DataTypes.STRING,
            email: DataTypes.STRING,
            bornDate: DataTypes.DATEONLY,
            country: DataTypes.STRING(2),
        },
        {
            timestamps: true,
            underscored: true,
            paranoid: true,
            sequelize,
        }
    );

    User.loaderById = SingleDataloader(User, 'id', { notFound: (k) => new UserNotFoundError(User, k) });
    User.loaderByName = MultipleDataloader(User, 'name');

    User.loaderByNameAndEmail = SingleDataloader(User, ['name', 'email']);
    User.loaderByNameAndCountry = MultipleDataloader(User, ['name', 'country']);

    User.loaderFrenchNames = SingleDataloader(User, 'name', { find: { where: { country: 'FR' } } });

    User.redisLoaderById = SingleDataloader(User, 'id', { redis: { client, ttl: 30 }, notFound: (k) => new UserNotFoundError(User, k) });
    User.redisLoaderByName = MultipleDataloader(User, 'name', { redis: { client, ttl: 30 } });
    User.redisLoaderByNameFrench = MultipleDataloader(User, 'name', { redis: { suffix: 'fr', client, ttl: 30 }, find: { where: { country: 'FR' } } });

    User.redisLoaderByNameAndEmail = SingleDataloader(User, ['name', 'email'], { redis: { client, ttl: 30 } });
    User.redisLoaderByNameAndCountry = MultipleDataloader(User, ['name', 'country'], { redis: { client, ttl: 30 } });

    return User;
};
