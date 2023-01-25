import assert from 'assert';
import { randomInt } from 'crypto';

type RequiredAndNotNull<T> = {
    [P in keyof T]-?: Exclude<T[P], null | undefined>;
};
type EmptyObject = {
    [K in any]: never;
};

declare global {
    function sleep(ms: number): Promise<void>;
    function filterNullAndUndefined<T extends Record<string, unknown>>(object: T): RequiredAndNotNull<T>;
    function extractNumber(str: string | null | undefined): number;
    function ObjectKeys<Obj extends object>(obj: Obj): (keyof Obj)[];
    function objectKeysToCamelCase<T extends Record<string, unknown>>(object: T): T;
    function notEmpty<T extends object>(obj: T | null | undefined): obj is Exclude<T, EmptyObject>;
    function recordToStringRecord(record: Record<string, unknown>): Record<string, string>;
    function flipCoin(): boolean;
}

global.sleep = function (millisec: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, millisec);
    });
};

global.filterNullAndUndefined = function <T extends Record<string, unknown>>(object: T): RequiredAndNotNull<T> {
    const objCopy = {} as RequiredAndNotNull<T>;
    ObjectKeys(object).forEach((key) => {
        const v = object[key];
        if (v !== null && v !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            objCopy[key] = v;
        }
    });
    return objCopy;
};

global.extractNumber = function (str: string | null | undefined): number {
    assert(str?.length, new Error(`Cannot extract number from ${str}`));
    const n = Number(str);
    assert(Number.isFinite(n), new Error(`Not isFinite(${n}) from ${str}`));
    return n;
};

global.ObjectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => Object.keys(obj) as (keyof Obj)[];

global.objectKeysToCamelCase = function <T extends Record<string, unknown>>(object: T): T {
    return Object.keys(object).reduce((value, key) => {
        value[key.toCamelCase() as keyof T] = object[key] as T[keyof T];
        return value;
    }, {} as T);
};

global.notEmpty = function <T extends object>(obj: T | null | undefined): obj is Exclude<T, EmptyObject> {
    return obj !== null && obj !== undefined && Object.keys(obj).length !== 0;
};

global.recordToStringRecord = function (record: Record<string, unknown>): Record<string, string> {
    return Object.keys(record).reduce((value, key) => {
        value[key] = String(record[key]);
        return value;
    }, {} as Record<string, string>);
};

global.flipCoin = function (): boolean {
    return randomInt(2) === 1;
};
