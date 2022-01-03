import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model {
    id!: number;
    name!: string;
    email!: string;
    createdAt!: Date;
    bornDate!: Date;
    country!: string;
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
