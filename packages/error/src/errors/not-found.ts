import { JsonError } from './json';

export class NotFoundError extends JsonError {
    code = '404';
    identifier: unknown;

    constructor(identifier: unknown, message: string) {
        super(message);
        this.identifier = identifier;

        Object.defineProperty(this, 'name', { value: this.constructor.name });
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
        };
    }
}
