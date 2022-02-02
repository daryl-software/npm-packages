declare module 'bfj' {
    import { Readable } from 'stream';

    function stringify(value: any): Promise<string>
    function parse(value: Readable): Promise<any>
}
