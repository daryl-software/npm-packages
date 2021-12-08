import { JsonError } from './json';

export class HttpError extends JsonError {
    public code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }

    toJSON(): { message: string; code: string } {
        return { code: `${this.code}`, message: this.message };
    }
}
