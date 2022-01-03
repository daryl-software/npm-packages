import { NotFoundError } from './errors/not-found';
export * from './errors/model-not-found';
export * from './errors/http';
export * from './errors/json';

export const nullIfNotFound = (e: Error): null => allowErrors(null, NotFoundError)(e);
export const undefinedIfNotFound = (e: Error): undefined => allowErrors(undefined, NotFoundError)(e);
export const emptyArrayIfNotFound = (e: Error): any[] => allowErrors([], NotFoundError)(e);

export function allowErrors<T>(returnValue: T, ...types: Function[]) {
    return (e: Error) => {
        if (types.find((type) => e instanceof type) !== undefined) {
            return returnValue;
        }
        throw e;
    };
}
export { NotFoundError };
