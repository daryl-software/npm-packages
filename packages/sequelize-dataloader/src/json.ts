// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JsonStringifyWithSymbols(object: any, clean?: boolean): string {
    const str = JSON.stringify(object, (_, value) => {
        if (Array.isArray(value) || value === null || typeof value !== 'object') {
            return value;
        }
        const props = [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];
        const replacement: Record<string, any> = {};
        for (const k of props) {
            if (typeof k === 'symbol') {
                replacement[`Symbol:${Symbol.keyFor(k)}`] = value[k];
            } else {
                replacement[k] = value[k];
            }
        }
        return replacement;
    });
    if (clean) {
        return str.replace(/[{}"[\]]/g, '');
    }

    return str;
}
