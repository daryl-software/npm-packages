export function JsonStringifyWithSymbols(object: any, clean?: boolean): string {
    const str = JSON.stringify(object, (_, value) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
            const props = [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];
            const replacement: any = {};
            for (const k of props) {
                if (typeof k === 'symbol') {
                    replacement[`Symbol:${Symbol.keyFor(k)}`] = value[k];
                } else {
                    replacement[k] = value[k];
                }
            }
            return replacement;
        }
        return value;
    });
    if (clean) {
        return str.replace(/[{}"[\]]/g, '');
    }

    return str;
}
