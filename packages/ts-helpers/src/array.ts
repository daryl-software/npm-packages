import { List } from 'ts-toolbelt';

declare global {
    interface Array<T> {
        first(): List.Head<this> extends never ? undefined : List.Head<this>;
        last(): List.Last<this> extends never ? undefined : List.Last<this>;
        filterNullAndUndefined(): Exclude<T, null | undefined>[];
        filterError(): Exclude<T, Error>[];
        filter<U extends T>(pred: (value: T, index: number, array: T[]) => value is U): U[];
        filterAsync<U extends T>(pred: (value: T, index?: number, array?: T[]) => Promise<boolean>): Promise<U[]>;
        groupBy(predicate: (v: T) => string | number): Record<string | number, T[]>;

        /**
         * Shuffle in place
         */
        shuffle(): T[];

        sum(this: number[]): number;
        avg(this: number[]): number;
        unique<T extends number | string>(this: T[]): T[];

        mapKey<Key extends keyof T>(key: Key): T[Key][];

        sample(): T;

        // ⚠️ Must copy all functions to ReadonlyArray below
    }

    interface ReadonlyArray<T> {
        first(): List.Head<this> extends never ? undefined : List.Head<this>;
        last(): List.Last<this> extends never ? undefined : List.Last<this>;
        filterNullAndUndefined(): Exclude<T, null | undefined>[];
        filterError(): Exclude<T, Error>[];
        filter<U extends T>(pred: (value: T, index: number, array: T[]) => value is U): U[];
        filterAsync<U extends T>(pred: (value: T, index?: number, array?: T[]) => Promise<boolean>): Promise<U[]>;
        groupBy(predicate: (v: T) => string | number): Record<string | number, T[]>;
        shuffle(): void;
        sum(this: number[]): number;
        avg(this: number[]): number;
        unique<T extends number | string>(this: T[]): T[];
        sample(): T;
        mapKey<Key extends keyof T>(key: Key): T[Key][];
    }

    interface ArrayConstructor {
        range(start: number, end: number): number[];
    }
}

Array.prototype.first = function () {
    return this.length > 0 ? this[0] : undefined;
};

Array.prototype.last = function () {
    const n = this.length;
    return n > 0 ? this[n - 1] : undefined;
};

Array.prototype.filterNullAndUndefined = function () {
    return this.filter((item) => item !== null && item !== undefined);
};
Array.prototype.filterError = function () {
    return this.filter((item) => !(item instanceof Error));
};

Array.prototype.filterAsync = async function (predicate) {
    const results = await Promise.all(this.map(predicate));
    return this.filter((_, index) => results[index]);
};

Array.prototype.groupBy = function (predicate) {
    return this.reduce((acc, value) => {
        (acc[predicate(value)] ||= []).push(value);
        return acc;
    }, {});
};

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

Array.prototype.sum = function () {
    return this.reduce((a, b) => a + b, 0);
};

Array.prototype.avg = function () {
    return this.sum() / this.length || 0;
};

Array.prototype.unique = function () {
    return [...new Set(this)];
};

Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.range = (start, end) => Array.from({ length: end - start }, (_, k) => k + start);

Array.prototype.mapKey = function (key) {
    return this.map((item) => item[key]);
};

export {};
