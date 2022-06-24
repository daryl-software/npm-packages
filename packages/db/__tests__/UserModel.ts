import { Sequelize, DataTypes, Model } from '@sequelize/core';

export class User extends Model {
    declare id: number;
    declare name: string;
    declare email: string;
    declare createdAt: Date;
    declare bornDate: Date;
    declare country: string;
}

export const initModel = (sequelize: Sequelize) =>
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
