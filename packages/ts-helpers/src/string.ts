export {};

declare global {
    interface String {
        ucfirst(): Capitalize<string>;
        explode(separator: string, limit?: number): string[];
        base64Decode(): string;
        mysqlCrc32(): number;
        uncapitalize(): string;
    }
}

String.prototype.ucfirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.base64Decode = function () {
    return Buffer.from(this, 'base64').toString('utf-8');
};

String.prototype.explode = function (separator: string, limit?: number): string[] {
    const array = this.split(separator);
    if (limit !== undefined && array.length >= limit) {
        array.push(array.splice(limit > 0 ? limit - 1 : 0).join(separator));
    }

    return array;
};

function makeCRCTable() {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c;
    }
    return crcTable;
}

let crcTable: number[] | undefined = undefined;

String.prototype.mysqlCrc32 = function () {
    crcTable = crcTable ?? makeCRCTable();
    let crc = -1;
    for (let i = 0, iTop = this.length; i < iTop; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ this.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
};

String.prototype.uncapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};
