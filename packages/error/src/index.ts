import { NotFoundError } from './errors/not-found';

export * from './errors/model-not-found';
export * from './errors/http';
export * from './errors/json';

export function allowErrors<T>(returnValue: T, ...types: Function[]): (e: Error) => T {
    return (e: Error) => {
        if (types.find((type) => e instanceof type) !== undefined) {
            return returnValue;
        }
        throw e;
    };
}

export function nullIfNotFound(e: Error) {
    return allowErrors(null, NotFoundError)(e);
}

export function undefinedIfNotFound(e: Error) {
    allowErrors(undefined, NotFoundError)(e);
    return undefined;
}

export function falseIfNotFound(e: Error) {
    return allowErrors(false, NotFoundError)(e);
}

export function zeroIfNotFound(e: Error) {
    return allowErrors(0, NotFoundError)(e);
}

export function emptyArrayIfNotFound<T>(e: Error): T[] {
    return allowErrors([], NotFoundError)(e);
}

export { NotFoundError };
