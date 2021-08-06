import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize';
import { SingleDataloader, MultipleDataloader } from '../src';
import { redisCluster as client } from './init.spec';
import { ModelNotFoundError } from "@ezweb/sequelize-dataloader";

export class UserNotFoundError<M extends Model = User> extends ModelNotFoundError<M> {
    id: number;
    constructor(model: ModelCtor<M>, identifier: number) {
        super(model, identifier);
        this.id = identifier;
    }
}

export class User extends Model {
    id!: number;
    name!: string;
    email!: string;
    createdAt!: Date;
    bornDate!: Date;
    country!: string;

    static loaderById = SingleDataloader(User, 'id', { notFound: (k) => new UserNotFoundError(User, k) });
    static loaderByName = MultipleDataloader(User, 'name');

    static loaderByNameAndEmail = SingleDataloader(User, ['name', 'email']);
    static loaderByNameAndCountry = MultipleDataloader(User, ['name', 'country']);

    static loaderFrenchNames = SingleDataloader(User, 'name', { find: { where: { country: 'FR' } } });

    static redisLoaderById = SingleDataloader(User, 'id', { redis: { client, ttl: 30 }, notFound: (k) => new UserNotFoundError(User, k) });
    static redisLoaderByName = MultipleDataloader(User, 'name', { redis: { client, ttl: 30 } });
    static redisLoaderByNameFrench = MultipleDataloader(User, 'name', { redis: { suffix: 'fr', client, ttl: 30 }, find: { where: { country: 'FR' } } });

    static redisLoaderByNameAndEmail = SingleDataloader(User, ['name', 'email'], { redis: { client, ttl: 30 } });
    static redisLoaderByNameAndCountry = MultipleDataloader(User, ['name', 'country'], { redis: { client, ttl: 30 } });
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
            country: DataTypes.CHAR(2),
        },
        {
            timestamps: true,
            underscored: true,
            paranoid: true,
            sequelize,
        }
    );

    return User;
};
