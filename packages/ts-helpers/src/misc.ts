import assert from 'assert';

type RequiredAndNotNull<T> = {
    [P in keyof T]-?: Exclude<T[P], null | undefined>;
};

declare global {
    function sleep(ms: number): Promise<void>;

    function filterNullAndUndefined<T extends Record<string, unknown>>(object: T): RequiredAndNotNull<T>;

    function extractNumber(str: string | null | undefined): number;

    function ObjectKeys<Obj>(obj: Obj): (keyof Obj)[];
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

global.ObjectKeys = <Obj>(obj: Obj): (keyof Obj)[] => Object.keys(obj) as (keyof Obj)[];
