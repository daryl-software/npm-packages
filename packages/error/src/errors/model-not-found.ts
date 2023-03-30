import { NotFoundError } from './not-found';
import { Model, ModelStatic } from '@sequelize/core';

export class ModelNotFoundError<M extends Model, I = unknown> extends NotFoundError {
    model: ModelStatic<M>;

    constructor(model: ModelStatic<M>, identifier: I) {
        super(identifier, `${model.name} not found for identifier ${JSON.stringify(identifier)}`);

        this.model = model;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            identifier: this.identifier,
        };
    }
}
