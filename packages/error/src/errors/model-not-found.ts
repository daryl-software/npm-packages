import { NotFoundError } from './not-found';
import { Model, ModelCtor } from 'sequelize';

export class ModelNotFoundError<M extends Model> extends NotFoundError {
    model: ModelCtor<M>;

    constructor(model: ModelCtor<M>, identifier: unknown) {
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
