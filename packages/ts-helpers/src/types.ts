export {};

declare global {
    type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
    type Mutable<T> = { -readonly [K in keyof T]: T[K] };
    type Modify<T, R> = Omit<T, keyof R> & R;
    type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] };
}
