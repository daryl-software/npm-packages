import { ModelAttributeColumnOptions, ModelCtor, Model } from 'sequelize';

const datefieldTypes = ['DATE', 'DATETIME', 'DATEONLY'];

export function restoreTimestampsSequelize<M extends Model>(data: Record<string, any>, instance: M) {
    const attrs: { [attribute: string]: ModelAttributeColumnOptions<M> } = (instance as any)['rawAttributes'];

    // todo cache this process ?
    Object.values(attrs).forEach((field) => {
        const type = typeof field.type === 'string' ? field.type : field.type.key;
        if (datefieldTypes.includes(type) && 'fieldName' in field) {
            const t = field as unknown as { fieldName: string };
            if (data[t.fieldName]) {
                instance.setDataValue(t.fieldName, new Date(data[t.fieldName]));
            }
        }
    });
}

export function hydrateModel<V extends Model>(model: ModelCtor<V>, data: V['_creationAttributes']): V {
    const instance = model.build(data, { isNewRecord: false, raw: false });
    restoreTimestampsSequelize(data, instance);
    return instance;
}
