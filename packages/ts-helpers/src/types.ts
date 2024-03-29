export {};

declare global {
    type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
    type Mutable<T> = { -readonly [K in keyof T]: T[K] };
    type Modify<T, R> = Omit<T, keyof R> & R;
    type Primitives = string | boolean | number;
    type Coordinates = {
        lat: number;
        lng: number;
        alt?: number;
    };
}
